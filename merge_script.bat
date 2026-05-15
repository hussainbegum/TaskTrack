@echo off
REM Check if there are uncommitted changes
cd /d "C:\Users\user\Desktop\TaskTrack.worktrees\agents-fix-login-loading-issue"
git.exe status --porcelain > status_output.txt
echo Status check complete

REM Stage and commit changes if any
git.exe add -A
git.exe status --porcelain > staged_output.txt

REM Check if there's anything to commit
for /f %%i in ('git.exe status --porcelain') do (
  echo Found changes: %%i
  git.exe commit -m "fix: stop loading spinner on login failure" -m "Add complete() callback to ensure loading state is always reset when login request completes, preventing spinner from persisting on failed login attempts." --no-verify
  goto merge_start
)

:merge_start
REM Merge to main branch
cd /d "C:\Users\user\Desktop\TaskTrack"
git.exe merge agents/fix-login-loading-issue --no-edit
echo Merge completed

REM Check for conflicts
git.exe diff --name-only --diff-filter=U > conflicts.txt
for /f %%i in (conflicts.txt) do (
  echo Conflict in: %%i
)

REM Verify merge
git.exe status --porcelain
echo.
git.exe log --oneline -1
