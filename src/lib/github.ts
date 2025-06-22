// Client-side GitHub API functions
import type { Endpoints } from "@octokit/types";
import { calculateSearchAfterDate } from "./date-utils";

// Use official Octokit types for better type safety
export type GitHubRelease =
  Endpoints["GET /repos/{owner}/{repo}/releases"]["response"]["data"][0];
export type GitHubIssue =
  Endpoints["GET /search/issues"]["response"]["data"]["items"][0];
export type SearchIssuesResponse =
  Endpoints["GET /search/issues"]["response"]["data"];

export interface CombinedSearchResult {
  version: string;
  release: {
    tag_name: string;
    name: string | null;
    published_at: string | null;
    html_url: string;
  } | null;
  mainRepoIssues: SearchIssuesResponse;
  ecosystemIssues: SearchIssuesResponse;
  searchedAfterDate?: string;
}

const GITHUB_API_BASE = "https://api.github.com";
const REPO_OWNER = "facebook";
const REPO_NAME = "react-native";

// Rate limiting helper
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

async function rateLimitedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();

  console.log(
    "import.meta.env.VITE_GITHUB_TOKEN",
    import.meta.env.VITE_GITHUB_TOKEN
  );

  const headers = {
    Accept: "application/vnd.github.v3+json",
    // Add GitHub token if available in environment
    ...(import.meta.env.VITE_GITHUB_TOKEN && {
      Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
    }),
    ...options?.headers,
  };

  const response = await fetch(url, { ...options, headers });

  // Handle rate limiting
  if (response.status === 403) {
    const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
    const rateLimitReset = response.headers.get("x-ratelimit-reset");

    if (rateLimitRemaining === "0" && rateLimitReset) {
      const resetTime = parseInt(rateLimitReset) * 1000;
      const waitTime = Math.max(resetTime - Date.now(), 0);

      console.warn(
        `Rate limit exceeded. Waiting ${Math.ceil(waitTime / 1000)} seconds...`
      );

      // Don't wait more than 5 minutes
      if (waitTime < 300000) {
        await new Promise((resolve) => setTimeout(resolve, waitTime + 1000));
        lastRequestTime = Date.now();
        return fetch(url, { ...options, headers });
      }
    }
  }

  return response;
}

// Cache for releases to avoid duplicate API calls
let releasesCache: GitHubRelease[] | null = null;
let releasesCacheTime: number = 0;
let releasesPromise: Promise<GitHubRelease[]> | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache

// Fetch React Native releases
async function fetchReactNativeReleases(): Promise<GitHubRelease[]> {
  const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/releases?per_page=100`;
  console.log("url", url);
  const response = await rateLimitedFetch(url);

  if (!response.ok) {
    if (response.status === 403) {
      const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
      if (rateLimitRemaining === "0") {
        throw new Error(
          "GitHub API rate limit exceeded. Please wait a moment and try again, or add a GITHUB_TOKEN environment variable to increase your rate limit."
        );
      }
      throw new Error(
        "GitHub API access forbidden. Consider adding a GITHUB_TOKEN environment variable."
      );
    }
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

export const getReactNativeReleases = async (): Promise<GitHubRelease[]> => {
  try {
    const now = Date.now();

    // Return cached data if it's still fresh
    if (releasesCache && now - releasesCacheTime < CACHE_DURATION) {
      console.log("Using cached releases data");
      return releasesCache;
    }

    // If there's already a request in progress, return that promise
    if (releasesPromise) {
      console.log("Using in-flight releases request");
      return releasesPromise;
    }

    console.log("Fetching fresh releases data");

    // Create and store the promise
    releasesPromise = fetchReactNativeReleases();

    const releases = await releasesPromise;

    // Update cache and clear the promise
    releasesCache = releases;
    releasesCacheTime = now;
    releasesPromise = null;

    return releases;
  } catch (error) {
    // Clear the promise on error
    releasesPromise = null;
    console.error("Error fetching React Native releases:", error);
    throw error;
  }
};

export async function findReleaseByVersion(
  version: string
): Promise<GitHubRelease | null> {
  try {
    const releases = await getReactNativeReleases();

    // Try to find exact match first
    let release = releases.find(
      (r: GitHubRelease) =>
        r.tag_name === version ||
        r.tag_name === `v${version}` ||
        r.name === version ||
        r.name === `v${version}`
    );

    // If no exact match, try partial match
    if (!release) {
      release = releases.find(
        (r: GitHubRelease) =>
          r.tag_name.includes(version) || (r.name && r.name.includes(version))
      );
    }

    return release || null;
  } catch (error) {
    console.error("Error finding release by version:", error);
    return null;
  }
}

// Search issues in main React Native repository
export async function searchMainRepoIssues(
  version: string,
  afterDate?: string,
  page: number = 1
): Promise<SearchIssuesResponse> {
  try {
    // Simple query for main repo issues mentioning the version
    let query = `repo:${REPO_OWNER}/${REPO_NAME} is:issue ("${version}" OR "react-native@${version}" OR "React Native ${version}")`;

    if (afterDate) {
      query += ` created:>${afterDate}`;
    }

    const url = new URL(`${GITHUB_API_BASE}/search/issues`);
    url.searchParams.set("q", query);
    url.searchParams.set("sort", "created");
    url.searchParams.set("order", "desc");
    url.searchParams.set("page", page.toString());
    url.searchParams.set("per_page", "20");

    const response = await rateLimitedFetch(url.toString());

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(
          "GitHub API rate limit exceeded. Please try again in a moment."
        );
      }
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error searching main repo issues:", error);
    throw error;
  }
}

// Search for issues in the ecosystem (excluding main repo)
export async function searchEcosystemIssues(
  version: string,
  afterDate?: string,
  page: number = 1
): Promise<SearchIssuesResponse> {
  try {
    // Search for React Native version mentions across all repos except the main one
    let query = `is:issue -repo:facebook/react-native ("react native ${version}" OR "react-native@${version}" OR "RN ${version}")`;

    if (afterDate) {
      query += ` created:>${afterDate}`;
    }

    const url = new URL(`${GITHUB_API_BASE}/search/issues`);
    url.searchParams.set("q", query);
    url.searchParams.set("sort", "created");
    url.searchParams.set("order", "desc");
    url.searchParams.set("page", page.toString());
    url.searchParams.set("per_page", "20");

    const response = await rateLimitedFetch(url.toString());

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(
          "GitHub API rate limit exceeded. Please wait a moment and try again, or add a GITHUB_TOKEN environment variable to increase your rate limit."
        );
      }
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error searching ecosystem issues:", error);
    throw error;
  }
}

// Helper function to extract repository name from GitHub URL
export function getRepositoryName(repositoryUrl: string): string {
  try {
    const match = repositoryUrl.match(/repos\/([^/]+\/[^/]+)/);
    return match ? match[1] : "Unknown";
  } catch {
    return "Unknown";
  }
}

// Main search function combining both main repo and ecosystem results
export const searchBugReportsForVersion = async (
  version: string,
  afterDate?: string,
  mainRepoPage: number = 1,
  ecosystemPage: number = 1
): Promise<CombinedSearchResult> => {
  try {
    // Find the release first to get the date if not provided
    const release = await findReleaseByVersion(version);

    // Calculate afterDate if not provided
    const searchAfterDate =
      afterDate ||
      (release?.published_at
        ? calculateSearchAfterDate(release.published_at)
        : undefined);

    // Search both main repo and ecosystem in parallel
    const [mainRepoIssues, ecosystemIssues] = await Promise.all([
      searchMainRepoIssues(version, searchAfterDate, mainRepoPage),
      searchEcosystemIssues(version, searchAfterDate, ecosystemPage),
    ]);

    return {
      version,
      release: release
        ? {
            tag_name: release.tag_name,
            name: release.name,
            published_at: release.published_at,
            html_url: release.html_url,
          }
        : null,
      mainRepoIssues,
      ecosystemIssues,
      searchedAfterDate: searchAfterDate,
    };
  } catch (error) {
    console.error("Error in combined search:", error);
    throw error;
  }
};
