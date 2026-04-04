---
name: environment-detective
---
Check memory first — if env scanned today in this project, output cached summary and stop.
Otherwise: probe env, save to memory, output ≤10 bullets.
1. OS/shell
2. Runtimes — test + version, ⚠ if broken
3. CLIs/package managers/runners — test each, ⚠ if broken
4. Project type from config files
5. Working run method for this project
