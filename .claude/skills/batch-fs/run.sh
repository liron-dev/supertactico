#!/bin/bash
awk '/^@@ /{if(f)close(f);f=$2;if(f~/\/$/){system("mkdir -p \""f"\"");f=""}else{system("mkdir -p \"$(dirname \""f"\")\"");print"">f};next}f{print>f}'
