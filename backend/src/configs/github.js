import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com';

class GitHubService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.api = axios.create({
      baseURL: GITHUB_API_URL,
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
  }

  async getUserInfo() {
    const response = await this.api.get('/user');
    return response.data;
  }

  async getRepositories() {
    const response = await this.api.get('/user/repos');
    return response.data;
  }

  async getBranches(owner, repo) {
    const response = await this.api.get(`/repos/${owner}/${repo}/branches`);
    return response.data;
  }

  async getPullRequests(owner, repo) {
    const response = await this.api.get(`/repos/${owner}/${repo}/pulls`);
    return response.data;
  }

  async getIssues(owner, repo) {
    const response = await this.api.get(`/repos/${owner}/${repo}/issues`);
    return response.data;
  }

  async getCommits(owner, repo) {
    const response = await this.api.get(`/repos/${owner}/${repo}/commits`);
    return response.data;
  }

  async getRepositoryInfo(owner, repo) {
    const [branches, pulls, issues, commits] = await Promise.all([
      this.getBranches(owner, repo),
      this.getPullRequests(owner, repo),
      this.getIssues(owner, repo),
      this.getCommits(owner, repo)
    ]);

    return {
      branches: branches.map(b => ({
        name: b.name,
        lastCommitSha: b.commit.sha
      })),
      pulls: pulls.map(p => ({
        title: p.title,
        pullNumber: p.number
      })),
      issues: issues.filter(i => !i.pull_request).map(i => ({
        title: i.title,
        issueNumber: i.number
      })),
      commits: commits.slice(0, 10).map(c => ({
        sha: c.sha,
        message: c.commit.message
      }))
    };
  }
}

export default GitHubService;