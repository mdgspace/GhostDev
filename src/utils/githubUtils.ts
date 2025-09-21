import * as vscode from 'vscode';

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