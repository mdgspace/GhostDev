
# import os
# import time
# import hashlib

# def hash_file(path):
#     try:
#         with open(path, 'rb') as f:
#             return hashlib.sha1(f.read()).hexdigest()
#     except FileNotFoundError:
#         return None

# def main():
#     index_path = os.path.join(os.getcwd(), ".git", "index")
#     if not os.path.exists(index_path):
#         print("[-] .git/index not found. Run this from your repo root.")
#         return

#     print(f"[INFO] Monitoring .git/index for git add operations...")
#     last_hash = hash_file(index_path)

#     while True:
#         time.sleep(1.5)  # Poll every 1.5s
#         new_hash = hash_file(index_path)
#         if new_hash != last_hash:
#             print("[+] Detected change in .git/index — likely a git add.")
#             last_hash = new_hash

# if __name__ == "__main__":
#     main()
import os
import time
import hashlib

def hash_file(path):
    try:
        with open(path, 'rb') as f:
            return hashlib.sha1(f.read()).hexdigest()
    except FileNotFoundError:
        return None

def get_commit_ref_file():
    head_path = os.path.join('.git', 'HEAD')
    try:
        with open(head_path, 'r') as f:
            content = f.read().strip()
            if content.startswith('ref:'):
                # Normal branch like refs/heads/main
                return os.path.join('.git', content[5:])
            else:
                # Detached HEAD state, no branch ref
                return None
    except:
        return None

def main():
    git_dir = os.path.join(os.getcwd(), ".git")
    index_path = os.path.join(git_dir, "index")
    ref_file = get_commit_ref_file()

    if not os.path.exists(index_path):
        print("[-] .git/index not found.")
        return

    if ref_file and os.path.exists(ref_file):
        print(f"[INFO] Monitoring git add/commit via index and branch ref: {ref_file}")
    else:
        print("[INFO] Monitoring git add only (detached HEAD or no commits yet)")

    last_index_hash = hash_file(index_path)
    last_ref_hash = hash_file(ref_file) if ref_file else None

    while True:
        time.sleep(1.5)

        new_index_hash = hash_file(index_path)
        new_ref_hash = hash_file(ref_file) if ref_file else None

        if new_index_hash != last_index_hash:
            if ref_file is None or new_ref_hash == last_ref_hash:
                print("[+] Detected `git add` (index changed, commit ref unchanged).")
            else:
                print("[i] Detected commit (ref updated).")

            last_index_hash = new_index_hash
            last_ref_hash = new_ref_hash

if __name__ == "__main__":
    main()
