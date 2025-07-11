from prompt_toolkit import PromptSession
from prompt_toolkit.auto_suggest import AutoSuggest
from prompt_toolkit.document import Document
import sys
import os

# Get the suggested commit message from command-line argument
suggested = sys.argv[1] if len(sys.argv) > 1 else 'git commit -m "Initial commit"'

class SimpleAutoSuggest(AutoSuggest):
    def get_suggestion(self, buffer, document: Document):
        text = document.text
        if suggested.startswith(text) and suggested != text:
            return Document(suggested[len(text):])
        return None

session = PromptSession(auto_suggest=SimpleAutoSuggest())

try:
    user_input = session.prompt()
    os.system(user_input)  # Run the entered command
except KeyboardInterrupt:
    print("\nCancelled.")
