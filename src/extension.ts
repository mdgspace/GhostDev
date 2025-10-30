import * as vscode from 'vscode';
import { GitExtension, Repository } from './git';
import { getDiffData, openDifftool } from './utils/gitUtils';
import { getCodeRefinements, suggestComment, ProjectDetails, generateFileStructure, generateDirectoryOverviews } from './utils/geminiUtils';
import { updateFilesInWorkspace, executeCommand, makeFileStructure } from './utils/terminalUtils';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fetchAllRepos } from './utils/githubUtils';
import { techStackData } from './assets/techStackData';
import { updateReadmes } from './utils/readmeUtils';

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

	const userRepos = await fetchAllRepos();

	let refRepos: string[] = [];

	if(userRepos && userRepos.length > 0) {

		const repoNames = userRepos.map(repo => ({
			label: repo.name,
			description: repo.private ? '🔒 Private' : '🌎 Public',
			detail: repo.description || 'No description'
		}));

		refRepos = await new Promise<string[]>((resolve) => {
			const quickPick = vscode.window.createQuickPick();
			quickPick.items = repoNames;
			quickPick.canSelectMany = true;
			quickPick.placeholder = 'Select from your repos or paste a public GitHub URL';
			quickPick.title = 'Select Repositories';

			quickPick.onDidAccept(() => {
				const selectedLabels = quickPick.selectedItems.map(item => item.label);
    			const typedValue = quickPick.value.trim();
    			const githubUrlRegex = /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-._]+$/;

    			// If the user typed a valid GitHub URL that isn't already selected, add it.
    			if (typedValue && githubUrlRegex.test(typedValue) && !selectedLabels.includes(typedValue)) {
        			selectedLabels.push(typedValue);
    			}

    			quickPick.hide();
    			resolve(selectedLabels);
			});

			quickPick.onDidHide(() => {
				// If it was hidden without accepting, resolve with selected items so far
				resolve(quickPick.selectedItems.map(item => item.label));
				quickPick.dispose();
			});

			quickPick.show();
		});
	}

	const projectDetails: ProjectDetails = {
		name, 
		desc, 
		techStack: techStack?techStack.map(tech => tech.label):[],
		refRepos
	};


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

			// --- generate directory READMEs ---
			progress.report({ message: "Generating directory README overviews..." });
			try {
				const dirOverviews = await generateDirectoryOverviews(refinedCode);
				await updateReadmes(dirOverviews);
			} catch (e: any) {
				console.warn('Failed to generate directory overviews:', e?.message || e);
			}

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

	const execAsync = promisify(exec);
	let debounceTimer: NodeJS.Timeout | undefined;
	const DEBOUNCE_MS = 300;

	// Track HEAD to ignore index updates caused by commits
	let lastHead: string | null = null;
	let lastHeadChangeAt = 0;
	const COMMIT_COOLDOWN_MS = 1000; // 1s cooldown after HEAD change

	// Initialize lastHead
	(async () => {
		try {
			const { stdout } = await execAsync('git rev-parse --verify HEAD', { cwd: repository.rootUri.fsPath });
			lastHead = stdout.trim() || null;
		} catch (err) {
			// No HEAD yet or failed to read; leave as null
			lastHead = null;
		}
	})();

	const checkAndHandleIndexChange = async () => {
		try {
			// Check for HEAD changes. If HEAD changed, update the lastHead and set a cooldown
			let currentHead: string | null = null;
			try {
				const { stdout } = await execAsync('git rev-parse --verify HEAD', { cwd: repository.rootUri.fsPath });
				currentHead = stdout.trim() || null;
			} catch (headErr) {
				currentHead = null;
			}

			if (lastHead !== currentHead) {
				lastHead = currentHead;
				lastHeadChangeAt = Date.now();
				// HEAD changed, ignore this index update
				return;
			}

			// Skip handling to avoid reacting to commit index writes
			if (Date.now() - lastHeadChangeAt < COMMIT_COOLDOWN_MS) {
				return;
			}

			// Only trigger when there are real staged files.
			const { stdout } = await execAsync('git diff --staged --name-only', { cwd: repository.rootUri.fsPath });
			const staged = stdout.trim();
			if (staged.length === 0) {
				// No staged files. Ignore.
				return;
			}

			// There are staged files. Call the handler.
			onFilesStaged();
		} catch (error: any) {
			console.error('Failed to check staged files for repository watcher:', error?.stderr || error?.message || error);
		}
	};

	const scheduleCheck = () => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
		debounceTimer = setTimeout(() => {
			debounceTimer = undefined;
			void checkAndHandleIndexChange();
		}, DEBOUNCE_MS);
	};

	watcher.onDidChange(scheduleCheck);
	watcher.onDidCreate(scheduleCheck);
	watcher.onDidDelete(scheduleCheck);

	// Ensure timers are cleared when the extension is deactivated or repository closed.
	context.subscriptions.push(watcher, new vscode.Disposable(() => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
	}));
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