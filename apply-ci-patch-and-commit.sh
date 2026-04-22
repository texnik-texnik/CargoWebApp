#!/bin/sh
set -e
# Apply the prepared patch, commit, and push. Run this locally in the repo root.
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

git config user.name "Copilot"
git config user.email "copilot@example.com"

if [ -f add-ci-workflow.patch ]; then
  echo "Applying patch add-ci-workflow.patch..."
  git apply add-ci-workflow.patch
fi

if git add .github/workflows/ci.yml && git diff --staged --quiet; then
  # No staged changes
  echo "No changes to commit."
else
  git commit -m "chore(ci): add CI workflow for build and tests

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
  echo "Committed .github/workflows/ci.yml"
  if git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
    echo "Pushing to current branch's upstream..."
    git push
  else
    echo "No upstream configured for current branch. Use 'git push -u origin <branch>' to push."
  fi
fi

exit 0
