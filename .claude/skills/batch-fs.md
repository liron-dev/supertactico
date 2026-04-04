# batch_fs
- `@@ path/` — dir
- `@@ path/file` — file (raw content below)

```
cat << 'EOF_BATCH' | awk '/^@@ /{if(f)close(f);f=$2;if(f~/\/$/){system("mkdir -p \""f"\"");f=""}else{system("mkdir -p \"$(dirname \""f"\")\" && > \""f"\"")};next}f{print>f}'
@@ <PATH>/
@@ <PATH>
<CONTENT>
EOF_BATCH
```
