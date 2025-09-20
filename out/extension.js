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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const gitUtils_1 = require("./utils/gitUtils");
const geminiUtils_1 = require("./utils/geminiUtils");
const terminalUtils_1 = require("./utils/terminalUtils");
function initializeProject() {
    return __awaiter(this, void 0, void 0, function* () {
        vscode.window.showInformationMessage('Initializing project with GhostDev...');
    });
}
function onFilesStaged() {
    return __awaiter(this, void 0, void 0, function* () {
        const message = 'Let GhostDev handle the rest for you!';
        const hauntWithDescButton = { title: 'Haunt Code with Description' };
        const hauntCodeButton = { title: 'Haunt Code' };
        const cancelButton = { title: 'Cancel' };
        const selection = yield vscode.window.showInformationMessage(message, { modal: false }, hauntWithDescButton, hauntCodeButton, cancelButton);
        if (!selection || selection.title === cancelButton.title) {
            return;
        }
        yield vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Haunting in progress...",
            cancellable: false
        }, (progress) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // --- getDiffData ---
                progress.report({ message: "Analyzing staged files..." });
                const diffData = yield (0, gitUtils_1.getDiffData)();
                if (diffData.length === 0) {
                    vscode.window.showInformationMessage("No staged changes found to haunt.");
                    return;
                }
                // --- getCodeRefinements & suggestComment (run in parallel) ---
                progress.report({ message: "Consulting the code spirits..." });
                const [refinedCode, suggestedComment] = yield Promise.all([
                    (0, geminiUtils_1.getCodeRefinements)(diffData),
                    (0, geminiUtils_1.suggestComment)(diffData)
                ]);
                // --- updateFilesInWorkspace ---
                progress.report({ message: "Applying code enchantments..." });
                const shouldIncludeDescription = selection === hauntWithDescButton;
                yield (0, terminalUtils_1.updateFilesInWorkspace)(refinedCode, shouldIncludeDescription);
                // --- openDiffTool ---
                progress.report({ message: "Opening difftool for your review..." });
                yield (0, gitUtils_1.openDifftool)();
                // --- stage refined files ---
                progress.report({ message: "Staging refined files..." });
                yield (0, terminalUtils_1.executeCommand)('git add .');
                // --- Inject commit command into the terminal ---
                const terminal = (_a = vscode.window.activeTerminal) !== null && _a !== void 0 ? _a : vscode.window.createTerminal('GhostDev Terminal');
                terminal.show();
                terminal.sendText(`git commit -m "${suggestedComment}"`, false);
            }
            catch (error) {
                console.error("GhostDev failed:", error);
                vscode.window.showErrorMessage(`GhostDev encountered a spooky error: ${error.message}`);
            }
        }));
    });
}
function setupRepositoryWatcher(context, repository) {
    const indexPath = vscode.Uri.joinPath(repository.rootUri, '.git/index');
    const watcher = vscode.workspace.createFileSystemWatcher(indexPath.fsPath);
    const handleIndexChange = () => {
        setTimeout(() => {
            if (repository.state.indexChanges.length > 0) {
                onFilesStaged();
            }
        }, 100);
    };
    watcher.onDidChange(handleIndexChange);
    watcher.onDidCreate(handleIndexChange);
    watcher.onDidDelete(handleIndexChange);
    context.subscriptions.push(watcher);
}
function activate(context) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        vscode.window.showInformationMessage('GhostDev is now haunting your code!');
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            const mainFolder = vscode.workspace.workspaceFolders[0].uri;
            try {
                const items = yield vscode.workspace.fs.readDirectory(mainFolder);
                if (items.length === 0) {
                    initializeProject();
                }
            }
            catch (error) {
                console.error("Failed to read workspace directory:", error);
            }
        }
        const gitExtension = (_a = vscode.extensions.getExtension('vscode.git')) === null || _a === void 0 ? void 0 : _a.exports;
        const git = gitExtension === null || gitExtension === void 0 ? void 0 : gitExtension.getAPI(1);
        if (!git) {
            vscode.window.showWarningMessage('GhostDev is unable to load the Git extension.');
            return;
        }
        for (const repository of git.repositories) {
            setupRepositoryWatcher(context, repository);
        }
        git.onDidOpenRepository(repository => {
            setupRepositoryWatcher(context, repository);
        });
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
