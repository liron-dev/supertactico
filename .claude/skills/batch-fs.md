---
name: batch-fs
description: Shell tool for 2+ file/folder creations
---
Heredoc syntax:
- `@@ path/to/dir/` — create dir (trailing slash = dir, no content)
- `@@ path/to/file` — create file; lines until next `@@` or `EOF_BATCH` become its content

```
cat << 'EOF_BATCH' | awk '/^@@ /{if(f)close(f);f=$2;if(f~/\/$/){system("mkdir -p \""f"\"");f=""}else{system("mkdir -p \"$(dirname \""f"\")\" && > \""f"\"")};next}f{print>f}'
@@ <DIR_PATH>/
@@ <FILE_PATH>
<FILE_CONTENT>
@@ <ANOTHER_FILE_PATH>
<ANOTHER_FILE_CONTENT>
EOF_BATCH
```
