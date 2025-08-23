const vscode = require('vscode');

class SuggestionContentProvider {
  constructor() {
    this._onDidChange = new vscode.EventEmitter();
    this.onDidChange = this._onDidChange.event;
    this._documents = new Map();
  }

  setContent(uri, content) {
    this._documents.set(uri.toString(), content);
    this._onDidChange.fire(uri);
  }

  provideTextDocumentContent(uri) {
    return this._documents.get(uri.toString()) || '';
  }
}

module.exports = { SuggestionContentProvider };
