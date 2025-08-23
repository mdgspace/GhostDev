import os
from git import Repo
import redis

cwd = os.getcwd()

repo_path = cwd
repo = Repo(repo_path)

diff_cached = repo.git.diff("--cached")
print(diff_cached)
diff_cached = "lololol"

r = redis.Redis(host='localhost', port=6379, decode_responses=True)
print("gitdiff stored in redis.")
r.set('gitdiff', diff_cached)
print(r.get('gitdiff'))

