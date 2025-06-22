import os
from git import Repo

cwd = os.getcwd()

repo_path = cwd
repo = Repo(repo_path)

diff_cached = repo.git.diff("--cached")
print(diff_cached)

