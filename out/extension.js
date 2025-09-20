"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function activate(context) {
    const provider = new SidebarViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(SidebarViewProvider.viewType, provider));
}
exports.activate = activate;
class SidebarViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'media')]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'buttonClicked': {
                    const selectedOptions = data.options;
                    vscode.window.showInformationMessage(`Button clicked! Options selected: ${JSON.stringify(selectedOptions)}`);
                    break;
                }
            }
        });
    }
    _getHtmlForWebview(webview) {
        const htmlPath = path.join(this._extensionUri.fsPath, 'media', 'sidebar.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        const stylesUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const nonce = getNonce();
        // Replace placeholders in the HTML
        htmlContent = htmlContent.replace(/\${webview.cspSource}/g, webview.cspSource);
        htmlContent = htmlContent.replace(/\${nonce}/g, nonce);
        htmlContent = htmlContent.replace(/\${stylesUri}/g, stylesUri.toString());
        htmlContent = htmlContent.replace(/\${scriptUri}/g, scriptUri.toString());
        return htmlContent;
    }
}
SidebarViewProvider.viewType = 'ghost-dev-view';
// Helper function to generate a random nonce for security
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
