#!/usr/bin/env python3
"""Deterministic AST and runtime verifier for the code-review skill."""

import ast
import json
import subprocess
import sys
import time
from pathlib import Path

PYTHON_BUILTINS = {"id", "list", "dict", "type", "str", "int", "float", "set", "max", "min", "sum"}


def analyze_ast(source: str):
    tree = ast.parse(source)
    findings = []

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            for arg in node.args.args:
                if arg.arg in PYTHON_BUILTINS:
                    findings.append({
                        "rule": "STYLE_BUILTIN_SHADOW",
                        "line": node.lineno,
                        "detail": f"Function '{node.name}' parameter '{arg.arg}' shadows Python built-in"
                    })

        if isinstance(node, (ast.For, ast.While)):
            for child in ast.walk(node):
                if isinstance(child, ast.Call) and isinstance(child.func, ast.Attribute):
                    if getattr(child.func.value, "id", None) == "time" and child.func.attr == "sleep":
                        findings.append({
                            "rule": "PERF_BLOCKING_SLEEP_IN_LOOP",
                            "line": child.lineno,
                            "detail": "Blocking time.sleep() call inside iteration loop"
                        })

        if isinstance(node, ast.Subscript):
            # Flag unguarded subscript u['name'] immediately following get_user_data assignment
            if (
                isinstance(node.value, ast.Name)
                and node.value.id == "u"
                and isinstance(node.slice, ast.Constant)
                and node.slice.value == "name"
            ):
                findings.append({
                    "rule": "CHECK_NONE_GUARD",
                    "line": node.lineno,
                    "detail": "Subscript u['name'] executed without prior None guard on get_user_data() return"
                })

    # If the file checks `if u is not None:` or `if u:` or `u.get(`, clear CHECK_NONE_GUARD
    if "if u is not None" in source or "if u:" in source or "u.get(" in source:
        findings = [f for f in findings if f["rule"] != "CHECK_NONE_GUARD"]

    return findings


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 ast_audit.py <file.py> [--json]")
        sys.exit(2)

    target = Path(sys.argv[1]).resolve()
    as_json = "--json" in sys.argv
    source = target.read_text(encoding="utf-8")
    findings = analyze_ast(source)

    t0 = time.perf_counter()
    proc = subprocess.run(
        [sys.executable, str(target)],
        capture_output=True,
        text=True,
        timeout=5
    )
    elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)

    if proc.returncode != 0:
        err_last = (proc.stderr.strip().splitlines() or ["Runtime error"])[-1]
        findings.insert(0, {
            "rule": "CORRECTNESS_RUNTIME_CRASH",
            "line": 0,
            "detail": err_last
        })

    report = {
        "file": target.name,
        "passed": len(findings) == 0 and proc.returncode == 0,
        "exitCode": proc.returncode,
        "runtimeMs": elapsed_ms,
        "violationsCount": len(findings),
        "findings": findings,
        "stdout": proc.stdout.strip()
    }

    if as_json:
        print(json.dumps(report, indent=2))
    else:
        status = "PASS" if report["passed"] else "FAIL"
        print(f"[AST_AUDIT] {status} | file={report['file']} | exit={report['exitCode']} | runtime={report['runtimeMs']}ms | violations={report['violationsCount']}")
        for f in findings:
            print(f"  - [{f['rule']}] line {f['line']}: {f['detail']}")

    sys.exit(0 if report["passed"] else 1)


if __name__ == "__main__":
    main()
