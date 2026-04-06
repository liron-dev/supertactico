---
name: batch-fs
description: Shell tool for 2+ file/folder creations
---
Call with no args. Write content only once in the heredoc.

`@@ path/dir/` = dir, `@@ path/file` + lines = file.

```bash
bash .claude/skills/batch-fs/run.sh << 'EOF'
@@ <DIR_PATH>/
@@ <FILE_PATH>
<FILE_CONTENT>
EOF
```
