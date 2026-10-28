---
name: code-review
description: Reviews code changes for bugs, security risks, style issues, and performance best practices. Use when reviewing PRs, auditing files, or checking code quality.
---

# Code Review Skill

When reviewing code in this project, always execute the deterministic AST and runtime validator first, then report findings against its output:

```bash
python3 .agents/skills/code-review/scripts/ast_audit.py <target_file.py>
```

## Review Checklist
1. **Correctness**: Does the code handle `None` returns before indexing dictionaries or objects?
2. **Edge Cases**: Are missing keys, empty collections, and zero/negative values handled safely?
3. **Style**: Does it follow PEP 8 conventions and avoid shadowing Python built-ins (`id`, `list`, `dict`, `type`)?
4. **Performance**: Are there blocking calls (`time.sleep`) inside iteration loops or avoidable $O(N)$ linear scans that should be indexed?

## How to Provide Feedback
- Include the exact output of `ast_audit.py` as external verification.
- Present a compact table with columns: `Rule`, `Line`, `Finding`, and `Fix`.
- When asked to fix the file, re-run `ast_audit.py` after editing to prove `0 violations` and report the runtime latency reduction in milliseconds.
