import * as vscode from 'vscode';

const AUTO_HEADER = '## Directory Overview (Auto-generated)';

function buildAutoSection(summary: string): string {
    return `${AUTO_HEADER}\n\n${summary.trim()}\n`;
}

async function readFileIfExists(uri: vscode.Uri): Promise<string | undefined> {
    try {
        const raw = await vscode.workspace.fs.readFile(uri);
        return Buffer.from(raw).toString('utf8');
    } catch {
        return undefined;
    }
}

function upsertAutoSection(existing: string | undefined, summary: string): string {
    const autoSection = buildAutoSection(summary);

    if (!existing || existing.trim().length === 0) {
        // Create a minimal README with just the auto section under a basic title
        return `# README\n\n${autoSection}`;
    }

    const headerRegex = /^##\s+Directory Overview \(Auto-generated\)\s*$/gim;
    const nextHeaderRegex = /^##\s+/gim;

    const match = headerRegex.exec(existing);
    if (match && typeof match.index === 'number') {
        const startOfHeader = match.index;
        const endOfHeader = startOfHeader + match[0].length;

        // Find the next level-2 header after the auto header to know replacement bounds
        nextHeaderRegex.lastIndex = endOfHeader;
        const nextHeaderMatch = nextHeaderRegex.exec(existing);
        const replaceEnd = nextHeaderMatch ? nextHeaderMatch.index : existing.length;

        const before = existing.slice(0, startOfHeader);
        const after = existing.slice(replaceEnd);
        const needsNewlineBefore = !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
        const needsNewlineAfter = after.startsWith('\n') ? '' : '\n';
        return `${before}${needsNewlineBefore}${autoSection}${needsNewlineAfter}${after}`;
    }

    // If no existing auto section, append one at the end, ensuring spacing
    const needsNewline = existing.endsWith('\n') ? '' : '\n';
    const needsDouble = existing.endsWith('\n\n') ? '' : (existing.endsWith('\n') ? '\n' : '\n\n');
    return `${existing}${needsDouble}${autoSection}${needsNewline}`;
}

export async function upsertReadmeForDirectory(dirRelativePath: string, summary: string): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        throw new Error('No open project folder found.');
    }
    const rootUri = workspaceFolder.uri;

    const dirUri = dirRelativePath === '.'
        ? rootUri
        : vscode.Uri.joinPath(rootUri, dirRelativePath);
    const readmeUri = vscode.Uri.joinPath(dirUri, 'README.md');

    // Ensure directory exists before writing
    await vscode.workspace.fs.createDirectory(dirUri);

    const existing = await readFileIfExists(readmeUri);
    const updated = upsertAutoSection(existing, summary);
    const bytes = Buffer.from(updated, 'utf8');
    await vscode.workspace.fs.writeFile(readmeUri, bytes);
}

export async function updateReadmes(summaries: Record<string, string>): Promise<void> {
    for (const [dir, summary] of Object.entries(summaries)) {
        try {
            await upsertReadmeForDirectory(dir || '.', summary);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(`Failed to update README for ${dir}:`, message);
            // Continue with other directories
        }
    }
}

export const README_AUTO_HEADER = AUTO_HEADER;
