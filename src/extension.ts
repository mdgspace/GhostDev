import * as vscode from 'vscode';
import { GitExtension, Repository } from './git';
import { getDiffData, openDifftool } from './utils/gitUtils';
import { getCodeRefinements, suggestComment, ProjectDetails, generateFileStructure } from './utils/geminiUtils';
import { updateFilesInWorkspace, executeCommand, makeFileStructure } from './utils/terminalUtils';
import { fetchAllRepos } from './utils/githubUtils';
import { techStackData } from './assets/techStackData';

async function initializeProject() {
	const name = await vscode.window.showInputBox({
		prompt: 'Enter the Project Name',
		placeHolder: 'project-name',
		validateInput: text => {
			return text ? null : 'Project name cannot be empty.';
		}
	});
	if (!name) { return; }

	const desc = await vscode.window.showInputBox({
		prompt: 'Please enter a short description of the project.',
		placeHolder: 'A client-side app to manage user tasks...'
	});
	if (desc === undefined) { return; }

	const techStackItems = techStackData.map(tech => ({
		label: tech.label,
		description: tech.description,
		detail: tech.detail
	}));
	const techStack = await vscode.window.showQuickPick(techStackItems, {
		canPickMany: true,
		placeHolder: 'Select the technologies you want to use'
	});

	if (!techStack || techStack.length === 0) { return; }

	const projectDetails: ProjectDetails = {
		name, 
		desc, 
		techStack: techStack.map(tech => tech.label)
	};

	const userRepos = await fetchAllRepos();

	if(userRepos && userRepos.length > 0) {

		const repoNames = userRepos.map(repo => ({
			label: repo.name,
			description: repo.private ? '🔒 Private' : '🌎 Public',
			detail: repo.description || 'No description'
		}));

		vscode.window.showQuickPick(repoNames, {
			placeHolder: 'Select a repository',
			canPickMany: true
		});
	}

	try {
		const fileStructure = await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "GhostDev is building a spooky project",
			cancellable: false
		}, async (progress) => {
			progress.report({ message: "Generating project architecture..." });
			return await generateFileStructure(projectDetails);
		});
		
		if (fileStructure) {
			await makeFileStructure(fileStructure);
		}

	} catch (error: any) {
		vscode.window.showErrorMessage(`Project initialization failed: ${error.message}`);
	}
}

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
        title: "Haunting in progress",
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

	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
		const mainFolder = vscode.workspace.workspaceFolders[0].uri;
		try {
			const items = await vscode.workspace.fs.readDirectory(mainFolder);
			if (items.length === 0) {
				initializeProject();
			}
		} catch (error) {
			console.error("Failed to read workspace directory:", error);
		}
	}
		

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