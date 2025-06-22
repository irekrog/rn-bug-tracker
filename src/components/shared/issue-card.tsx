import { GitHubIssue, getRepositoryName } from "@/lib/github";
import { formatRelativeTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, User, Calendar, GitBranch } from "lucide-react";

interface IssueCardProps {
  issue: GitHubIssue;
  searchTerm?: string;
}

// Function to find and highlight search term in text
function getHighlightedTextFragment(
  text: string,
  searchTerm: string,
  maxLength: number = 200
): {
  fragment: string;
  highlighted: React.ReactNode;
} {
  if (!searchTerm || !text) {
    const truncated = text?.slice(0, maxLength) || "";
    return {
      fragment: truncated + (text?.length > maxLength ? "..." : ""),
      highlighted: (
        <span>{truncated + (text?.length > maxLength ? "..." : "")}</span>
      ),
    };
  }

  // Find all possible version patterns in the text
  const searchPatterns = [
    searchTerm,
    `v${searchTerm}`,
    `${searchTerm}`,
    `react-native@${searchTerm}`,
    `React Native ${searchTerm}`,
    `RN ${searchTerm}`,
    `React Native Version ${searchTerm}`,
  ];

  let bestMatch = { index: -1, pattern: "", actualMatch: "" };

  // Find the first occurrence of any search pattern (case insensitive)
  for (const pattern of searchPatterns) {
    const regex = new RegExp(
      pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    );
    const match = text.match(regex);
    if (match && match.index !== undefined) {
      const index = match.index;
      if (bestMatch.index === -1 || index < bestMatch.index) {
        bestMatch = {
          index,
          pattern,
          actualMatch: match[0],
        };
      }
    }
  }

  // If no match found, return first part of text
  if (bestMatch.index === -1) {
    const truncated = text.slice(0, maxLength);
    return {
      fragment: truncated + (text.length > maxLength ? "..." : ""),
      highlighted: (
        <span>{truncated + (text.length > maxLength ? "..." : "")}</span>
      ),
    };
  }

  // Calculate fragment boundaries around the match
  const matchStart = bestMatch.index;
  const matchEnd = matchStart + bestMatch.actualMatch.length;
  const halfMaxLength = Math.floor(maxLength / 2);

  let fragmentStart = Math.max(0, matchStart - halfMaxLength);
  let fragmentEnd = Math.min(text.length, matchEnd + halfMaxLength);

  // Adjust to try to keep the fragment around maxLength
  if (fragmentEnd - fragmentStart < maxLength) {
    if (fragmentStart === 0) {
      fragmentEnd = Math.min(text.length, fragmentStart + maxLength);
    } else if (fragmentEnd === text.length) {
      fragmentStart = Math.max(0, fragmentEnd - maxLength);
    }
  }

  // Extract the fragment
  const fragment = text.slice(fragmentStart, fragmentEnd);
  const prefix = fragmentStart > 0 ? "..." : "";
  const suffix = fragmentEnd < text.length ? "..." : "";

  // Calculate relative positions within the fragment
  const relativeMatchStart = matchStart - fragmentStart;
  const relativeMatchEnd = matchEnd - fragmentStart;

  // Create highlighted text
  const beforeMatch = fragment.slice(0, relativeMatchStart);
  const matchText = fragment.slice(relativeMatchStart, relativeMatchEnd);
  const afterMatch = fragment.slice(relativeMatchEnd);

  const highlighted = (
    <span>
      {prefix}
      {beforeMatch}
      <mark className="bg-yellow-200 dark:bg-yellow-900 px-1 rounded font-medium">
        {matchText}
      </mark>
      {afterMatch}
      {suffix}
    </span>
  );

  return {
    fragment: prefix + fragment + suffix,
    highlighted,
  };
}

export function IssueCard({ issue, searchTerm }: IssueCardProps) {
  const getStatusVariant = (state: string) => {
    return state === "open" ? "destructive" : "secondary";
  };

  const getStatusText = (state: string) => {
    return state === "open" ? "Open" : "Closed";
  };

  const repositoryName = getRepositoryName(issue.repository_url);

  // Get repository display name (shorter version)
  const getRepoDisplayName = (repoName: string) => {
    if (repoName === "facebook/react-native") return "React Native";
    if (repoName.startsWith("react-native-community/")) {
      return repoName.replace("react-native-community/", "RN Community: ");
    }
    if (repoName.startsWith("software-mansion/")) {
      return repoName.replace("software-mansion/", "");
    }
    return repoName;
  };

  // Get highlighted text fragment and teaser
  const { highlighted: highlightedBody, fragment: highlightedFragment } =
    issue.body
      ? getHighlightedTextFragment(issue.body, searchTerm || "", 200)
      : { highlighted: null, fragment: "" };

  // Get teaser (first 200 characters)
  const teaser = issue.body
    ? issue.body.slice(0, 200) + (issue.body.length > 200 ? "..." : "")
    : "";

  // Check if highlighted fragment is different from teaser (to avoid duplication)
  const showSeparateHighlight =
    searchTerm &&
    issue.body &&
    highlightedFragment !== teaser &&
    highlightedFragment.includes(searchTerm);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg leading-tight line-clamp-2 mb-2">
              <a
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors hover:underline"
              >
                {issue.title}
              </a>
            </CardTitle>
            <div className="flex items-center gap-2 mb-1">
              <GitBranch className="h-3 w-3 text-muted-foreground" />
              <a
                href={`https://github.com/${repositoryName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground font-medium hover:text-primary transition-colors hover:underline truncate"
              >
                {getRepoDisplayName(repositoryName)}
              </a>
            </div>
          </div>
          <Badge
            variant={getStatusVariant(issue.state)}
            className="shrink-0 self-start"
          >
            {getStatusText(issue.state)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
        {/* Issue body teaser */}
        {issue.body && teaser && (
          <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3">
            {teaser}
          </p>
        )}

        {/* Highlighted fragment (if different from teaser) */}
        {showSeparateHighlight && (
          <div className="border-l-2 border-yellow-400 pl-2 sm:pl-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-r-md py-2">
            <p className="text-xs text-muted-foreground mb-1 font-medium">
              Found fragment:
            </p>
            <p className="text-sm text-muted-foreground">{highlightedBody}</p>
          </div>
        )}

        {/* Labels */}
        {issue.labels && issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {issue.labels.slice(0, 2).map((label) => (
              <Badge
                key={label.name}
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: `#${label.color}`,
                  color: `#${label.color}`,
                }}
              >
                {label.name}
              </Badge>
            ))}
            {issue.labels.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{issue.labels.length - 2} more
              </Badge>
            )}
          </div>
        )}

        {/* Issue metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <a
                href={`https://github.com/${issue.user?.login || "unknown"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors hover:underline truncate"
              >
                {issue.user?.login || "Unknown user"}
              </a>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs sm:text-sm">
                {formatRelativeTime(issue.created_at)}
                <span className="hidden sm:inline">
                  {" "}
                  (
                  {new Date(issue.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                  ,{" "}
                  {new Date(issue.created_at).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  )
                </span>
              </span>
            </div>
          </div>

          <a
            href={issue.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors self-start sm:self-auto"
          >
            <span>#{issue.number}</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
