// Date utilities for React Native bug tracker

/**
 * Calculates the search date for GitHub issues based on a release date.
 * Returns the release date formatted as YYYY-MM-DD for GitHub API queries.
 * Issues created after this date will be included in search results.
 */
export function calculateSearchAfterDate(releaseDate: string): string {
  const date = new Date(releaseDate)
  // Search for issues created after the release date
  return date.toISOString().split('T')[0]
}