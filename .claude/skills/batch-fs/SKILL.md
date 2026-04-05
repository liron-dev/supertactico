---
name: batch-fs
description: Shell tool for 2+ file/folder creations
---
`@@ path/dir/` = dir, `@@ path/file` + lines = file.

```bash
bash .claude/skills/batch-fs/run.sh << 'EOF'
@@ <DIR_PATH>/
@@ <FILE_PATH>
<FILE_CONTENT>
@@ <ANOTHER_FILE_PATH>
<ANOTHER_FILE_CONTENT>
EOF
```