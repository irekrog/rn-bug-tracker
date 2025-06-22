import {
  searchBugReportsForVersion,
  getReactNativeReleases,
  CombinedSearchResult,
} from "./github";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Replace the releases API route
export async function fetchVersions(): Promise<
  ApiResponse<{
    versions: Array<{
      tag: string;
      name: string;
      version: string;
      published_at: string;
    }>;
  }>
> {
  try {
    const releases = await getReactNativeReleases();

    // Helper function to check if a version is a release candidate
    const isReleaseCandidate = (tagName: string): boolean => {
      const normalizedTag = tagName.toLowerCase();
      return (
        normalizedTag.includes("rc") ||
        normalizedTag.includes("alpha") ||
        normalizedTag.includes("beta") ||
        normalizedTag.includes("canary") ||
        normalizedTag.includes("next")
      );
    };

    // Extract version information, filter out release candidates, and sort by published date (newest first)
    const versions = releases
      .filter((release: any) => !isReleaseCandidate(release.tag_name))
      .map((release: any) => ({
        tag: release.tag_name,
        name: release.name,
        version: release.tag_name.replace(/^v/, ""), // Remove 'v' prefix
        published_at: release.published_at,
      }))
      .sort(
        (a: any, b: any) =>
          new Date(b.published_at).getTime() -
          new Date(a.published_at).getTime()
      );

    return { data: { versions } };
  } catch (error) {
    console.error("API Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return { error: errorMessage };
  }
}

// Replace the search API route
export async function fetchBugReports(
  version: string,
  mainRepoPage: number = 1,
  ecosystemPage: number = 1
): Promise<ApiResponse<CombinedSearchResult>> {
  try {
    if (!version) {
      return { error: "Parameter 'version' is required" };
    }

    // Get combined search results with separate pagination for main repo and ecosystem
    const results = await searchBugReportsForVersion(
      version,
      undefined,
      mainRepoPage,
      ecosystemPage
    );

    return { data: results };
  } catch (error) {
    console.error("API Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return { error: errorMessage };
  }
}
