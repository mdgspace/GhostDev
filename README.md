- **User Action**: User commits his code
- **User Action**: User hits on the "Suggest Code"

```js
changed_files_paths = git diff HEAD~1 HEAD

for file_path in changed_files_paths:
    org_code = git show HEAD~1:file_path
    diff_code = git diff HEAD~1 HEAD -- file_path
    suggested_code = LLM(
        prompt: "Generated better code for",
        org_code
        diff_code
    )
    suggested_code >> file_path

git add .

git config --global diff.tool vscode
git config --global difftool.vscode.cmd "code --wait --diff \$LOCAL \$REMOTE"

git difftool --staged
"Y \n" * changed_files_paths.length
git add .
git commit -m "Refined Code"
```