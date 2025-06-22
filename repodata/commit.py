import os
from git import Repo

cwd = os.getcwd()

repo_path = cwd
repo = Repo(repo_path)

diff_cached = repo.index.diff("HEAD")

for diff in diff_cached:
    print(f"Staged change in: {diff.a_path}")
    print(diff.diff.decode())

print("hello")