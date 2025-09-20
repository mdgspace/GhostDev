import * as vscode from 'vscode';
import { GitExtension, Repository } from './git';
import { getDiffData, openDifftool } from './utils/gitUtils';
import { getCodeRefinements, suggestComment, RefinedCode } from './utils/geminiUtils';
import { updateFilesInWorkspace, executeCommand } from './utils/terminalUtils';

async function onFilesStaged() {
	
    const message = 'Let GhostDev handle the rest for you!';
    const hauntWithDescButton: vscode.MessageItem = { title: 'Haunt Code with Description' };
    const hauntCodeButton: vscode.MessageItem = { title: 'Haunt Code' };
    const cancelButton: vscode.MessageItem = { title: 'Cancel' };

    const selection = await vscode.window.showInformationMessage(
        message,
        { modal: false },
        hauntWithDescButton,
        hauntCodeButton,
        cancelButton
    );

    if (!selection || selection.title === cancelButton.title) {
        return;
    }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Haunting in progress...",
        cancellable: false
    }, async (progress) => {
        try {
            // --- getDiffData ---
            progress.report({ message: "Analyzing staged files..." });
            const diffData = await getDiffData();
            if (diffData.length === 0) {
                vscode.window.showInformationMessage("No staged changes found to haunt.");
                return;
            }

            // --- getCodeRefinements & suggestComment (run in parallel) ---
            progress.report({ message: "Consulting the code spirits..." });
            const [refinedCode, suggestedComment] = await Promise.all([
                getCodeRefinements(diffData),
                suggestComment(diffData)
            ]);

            // --- updateFilesInWorkspace ---
            progress.report({ message: "Applying code enchantments..." });
            const shouldIncludeDescription = selection === hauntWithDescButton;
            await updateFilesInWorkspace(refinedCode, shouldIncludeDescription);

			// --- openDiffTool ---
			progress.report({ message: "Opening difftool for your review..." });
			await openDifftool();

			// --- stage refined files ---
			progress.report({ message: "Staging refined files..." });
			await executeCommand('git add .');

            // --- Inject commit command into the terminal ---
            const terminal = vscode.window.activeTerminal ?? vscode.window.createTerminal('GhostDev Terminal');
            terminal.show();
            terminal.sendText(`git commit -m "${suggestedComment}"`, false);

        } catch (error: any) {
            console.error("GhostDev failed:", error);
            vscode.window.showErrorMessage(`GhostDev encountered a spooky error: ${error.message}`);
        }
    });
}

function setupRepositoryWatcher(context: vscode.ExtensionContext, repository: Repository) {
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

export async function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage('GhostDev is now haunting your code!');
	const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports;
	const git = gitExtension?.getAPI(1);
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
}

export function deactivate() {}