import * as vscode from 'vscode';
import { setProjectPersona } from './geminiUtils';

interface GitHubRepo {
  name: string;
  html_url: string;
  description: string | null;
  private: boolean;
}

export async function fetchAllRepos(): Promise<GitHubRepo[] | undefined> {
  try {
    const session = await vscode.authentication.getSession('github', ['repo'], { createIfNone: true });
    if (!session) {
      vscode.window.showWarningMessage('You must sign in to GitHub to fetch your repositories.');
      return undefined;
    }
    const token = session.accessToken;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch('https://api.github.com/user/repos?type=all&sort=updated&per_page=100', { headers });
    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.statusText}`);
    }

    const repos: GitHubRepo[] = await response.json() as GitHubRepo[];

    vscode.window.showInformationMessage(`✅ Successfully fetched ${repos.length} repositories!`);
    return repos;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    vscode.window.showErrorMessage(`Error fetching GitHub repositories: ${errorMessage}`);
    console.error(error);
    return undefined;
  }
}

interface AnalysisAccumulator {
  indentation: { [key: string]: number };
  quotes: { single: number; double: number };
  fileNameConventions: { [key: string]: number };
  topLevelDirs: { [key: string]: number };
  commitStyles: { [key: string]: number };
  username: string;
}

async function analyzeFileContent(url: string, headers: any, accumulator: AnalysisAccumulator): Promise<void> {
  const response = await fetch(url, { headers });
  if (!response.ok) return;

  const blob = await response.json() as any;
  const content = Buffer.from(blob.content, 'base64').toString('utf8');

  const indentMatch = content.match(/^[ \t]+/m);
  if (indentMatch) {
    const indent = indentMatch[0];
    const style = indent.includes('\t') ? 'tab' : 'space';
    const key = `${style}_${indent.length}`;
    accumulator.indentation[key] = (accumulator.indentation[key] || 0) + 1;
  }

  const singleQuotes = (content.match(/'/g) || []).length;
  const doubleQuotes = (content.match(/"/g) || []).length;
  accumulator.quotes.single += singleQuotes;
  accumulator.quotes.double += doubleQuotes;
}

function analyzeTree(tree: any[], accumulator: AnalysisAccumulator): string[] {
    const codeFileUrls: string[] = [];
    const relevantExtensions = ['.js', '.ts', '.py', '.go', '.java', '.cs', '.rb', '.php'];

    for (const item of tree) {
        if (item.type !== 'blob') continue;

        const pathParts = item.path.split('/');
        if (pathParts.length > 1) {
            const dir = pathParts[0];
            if (!['node_modules', '.git', 'dist', 'build'].includes(dir)) {
                 accumulator.topLevelDirs[dir] = (accumulator.topLevelDirs[dir] || 0) + 1;
            }
        }

        const fileName = pathParts[pathParts.length - 1];
        if (fileName.includes('-')) {
            accumulator.fileNameConventions.kebabCase = (accumulator.fileNameConventions.kebabCase || 0) + 1;
        } else if (fileName.includes('_')) {
            accumulator.fileNameConventions.snakeCase = (accumulator.fileNameConventions.snakeCase || 0) + 1;
        } else if (fileName[0] === fileName[0].toUpperCase() && fileName.includes('.')) {
             accumulator.fileNameConventions.pascalCase = (accumulator.fileNameConventions.pascalCase || 0) + 1;
        } else {
            accumulator.fileNameConventions.camelCase = (accumulator.fileNameConventions.camelCase || 0) + 1;
        }

        if (relevantExtensions.some(ext => fileName.endsWith(ext)) && codeFileUrls.length < 5) {
             codeFileUrls.push(item.url);
        }
    }
    return codeFileUrls;
}

async function analyzeCommits(owner: string, repo: string, headers: any, accumulator: AnalysisAccumulator): Promise<void> {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`;
    const response = await fetch(url, { headers });
    if (!response.ok) return;

    const commits = await response.json() as any;
    const conventionalCommitRegex = /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?!?:/;

    for (const commit of commits) {
        if (conventionalCommitRegex.test(commit.commit.message)) {
            accumulator.commitStyles.conventional = (accumulator.commitStyles.conventional || 0) + 1;
        } else {
            accumulator.commitStyles.unconventional = (accumulator.commitStyles.unconventional || 0) + 1;
        }
    }
}

function getDominantKey(obj: { [key: string]: number }): string {
    if (Object.keys(obj).length === 0) return 'unknown';
    return Object.keys(obj).reduce((a, b) => (obj[a] > obj[b] ? a : b));
}

export async function fetchRepoPersona(repoNames: string[]): Promise<any> {
  try {
    const session = await vscode.authentication.getSession('github', ['repo'], { createIfNone: true });
    if (!session) {
      vscode.window.showWarningMessage('You must sign in to GitHub to fetch your repositories.');
      return undefined;
    }
    const token = session.accessToken;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    const userResponse = await fetch('https://api.github.com/user', { headers });
     if (!userResponse.ok) {
        throw new Error(`Failed to fetch GitHub user: ${userResponse.statusText}`);
    }
    const user = await userResponse.json() as any;
    const username = user.login;

    const accumulator: AnalysisAccumulator = {
        indentation: {},
        quotes: { single: 0, double: 0 },
        fileNameConventions: {},
        topLevelDirs: {},
        commitStyles: {},
        username,
    };

    for (const repoIdentifier of repoNames) {
        let owner = username;
        let repoName;

        const urlMatch = repoIdentifier.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)/);

        if (urlMatch) {
            owner = urlMatch[1];
            repoName = urlMatch[2].replace(/\.git$/, "");
        } else {
            repoName = repoIdentifier;
        }

        try {
            const repoDetailsResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, { headers });
            if (!repoDetailsResponse.ok) {
                vscode.window.showWarningMessage(`Could not fetch details for ${owner}/${repoName}. Skipping.`);
                continue;
            }
            
            const repoDetails = await repoDetailsResponse.json() as any;
            const defaultBranch = repoDetails.default_branch;

            const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees/${defaultBranch}?recursive=1`, { headers });
            if (!treeResponse.ok) {
                continue;
            }
            const treeData = await treeResponse.json() as any;

            if (treeData.tree) {
                const filesToAnalyze = analyzeTree(treeData.tree, accumulator);
                await Promise.all(filesToAnalyze.map(url => analyzeFileContent(url, headers, accumulator)));
            }
            
            await analyzeCommits(owner, repoName, headers, accumulator);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to analyze repo: ${owner}/${repoName}`);
            continue;
        }
    }

    const dominantIndent = getDominantKey(accumulator.indentation).split('_');
    const dominantFileName = getDominantKey(accumulator.fileNameConventions);
    const dominantCommitStyle = getDominantKey(accumulator.commitStyles);

    const persona: UserPersona = {
      metadata: {
        username: accumulator.username,
        analysisDate: new Date().toISOString(),
        analyzedRepoCount: repoNames.length
      },
      codingStyle: {
        indentation: {
          style: dominantIndent[0],
          size: parseInt(dominantIndent[1]) || 0,
        },
        namingConvention: {
          files: dominantFileName
        },
        stringQuotation: {
          preference: accumulator.quotes.single > accumulator.quotes.double ? 'single' : 'double',
        },
      },
      fileStructure: {
        directoryOrganization: accumulator.topLevelDirs['src'] > 0 ? "Source-separated (e.g., 'src/' or 'lib/')" : 'Mixed',
        commonTopLevelDirs: Object.keys(accumulator.topLevelDirs).sort((a,b) => accumulator.topLevelDirs[b] - accumulator.topLevelDirs[a]).slice(0, 4)
      },
      repositoryInsights: {
        commitPatterns: {
          style: dominantCommitStyle === 'conventional' ? "Follows Conventional Commits standard" : "Unconventional or mixed style",
        },
        testingPractices: {
            testFileLocation: accumulator.topLevelDirs['tests'] > 0 || accumulator.topLevelDirs['test'] > 0 ? 'Dedicated test directory' : 'Unknown'
        }
      }
    };

    setProjectPersona(persona);

    return persona;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    vscode.window.showErrorMessage(`Error fetching GitHub persona: ${errorMessage}`);
    console.error(error);
    return undefined;
  }
}

interface UserPersona {
    metadata: {
        username: string;
        analysisDate: string;
        analyzedRepoCount: number;
    };
    codingStyle: {
        indentation: {
            style: string;
            size: number;
        };
        namingConvention: {
            files: string;
        };
        stringQuotation: {
            preference: string;
        };
    };
    fileStructure: {
        directoryOrganization: string;
        commonTopLevelDirs: string[];
    };
    repositoryInsights: {
        commitPatterns: {
            style: string;
        };
        testingPractices: {
            testFileLocation: string;
        };
    };
}

export async function showPersonaSummary(persona: UserPersona): Promise<void> {
    if (!persona?.metadata?.username) {
        vscode.window.showWarningMessage("Could not display persona: the provided object is invalid or empty.");
        return;
    }

    const { metadata, codingStyle, repositoryInsights, fileStructure } = persona;
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const summaryLines: string[] = [
        `👤 Coding Persona for: ${metadata.username}`,
        '---',
    ];

    if (codingStyle?.indentation?.style && codingStyle.indentation.size > 0) {
        summaryLines.push(`✒️ Indentation: ${codingStyle.indentation.size} ${capitalize(codingStyle.indentation.style)}s`);
    }
    if (codingStyle?.namingConvention?.files) {
        summaryLines.push(`📄 File Naming: ${capitalize(codingStyle.namingConvention.files)}`);
    }
    if (repositoryInsights?.commitPatterns?.style) {
        summaryLines.push(`📦 Commit Style: ${repositoryInsights.commitPatterns.style}`);
    }
    if (fileStructure?.directoryOrganization) {
        summaryLines.push(`🗂️ Folder Structure: ${fileStructure.directoryOrganization}`);
    }

    const message = summaryLines.join('\n');
    const viewJsonButton: vscode.MessageItem = { title: "View Full Details" };
    const selection = await vscode.window.showInformationMessage(message, { modal: true }, viewJsonButton);
    if (selection === viewJsonButton) {
        const fullPersonaJson = JSON.stringify(persona, null, 2);
        const doc = await vscode.workspace.openTextDocument({
            content: fullPersonaJson,
            language: 'json'
        });
        await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
    }
}