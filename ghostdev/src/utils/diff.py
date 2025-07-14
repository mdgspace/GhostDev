import os
from git import Repo
import redis

cwd = os.getcwd()

try:
    repo_path = cwd
    repo = Repo(repo_path)
    
    # Check if this is actually a git repository
    if not repo.git_dir:
        print("No Git repository found in current directory")
        diff_cached = ""
    else:
        diff_cached = repo.git.diff("--cached")
        print(diff_cached)
        
except Exception as e:
    print(f"Error accessing Git repository: {e}")
    diff_cached = ""

r = redis.Redis(host='localhost', port=6379, decode_responses=True)
r.set('gitdiff', diff_cached)
