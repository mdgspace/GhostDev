import os
from git import Repo
#from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

cwd = os.getcwd()

repo_path = cwd
repo = Repo(repo_path)

class GitIndexChangeHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if ".git/index" in event.src_path:
            print("\n:arrows_counterclockwise: Detected staging change via git add!")
            diff_cached = repo.git.diff("--cached")
            print(diff_cached)



