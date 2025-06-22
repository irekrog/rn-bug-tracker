import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Suspense } from "react";
import { Label } from "@/components/ui/label";
import { SearchForm } from "@/components/shared/search-form";
import SearchResultsWithPagination from "@/components/shared/search-results-with-pagination";
import { useVersions } from "@/hooks/use-versions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug, Clock, Search as SearchIcon } from "lucide-react";

interface SearchParams {
  version?: string;
  mainRepoPage?: string;
  ecosystemPage?: string;
  activeTab?: string;
  search?: string;
}

// Loading component for versions
function VersionsLoading() {
  return (
    <div className="w-full max-w-md space-y-3 flex flex-col items-center">
      <Label className="text-center block text-sm font-medium">
        React Native Version
      </Label>
      <div className="flex gap-3 items-center w-full">
        <div className="flex-1">
          <div className="h-10 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="h-10 w-20 bg-muted animate-pulse rounded-md" />
      </div>
    </div>
  );
}

// Loading component for search results
function SearchResultsLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 animate-spin" />
            <div className="h-6 bg-muted animate-pulse rounded w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-full" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Component for Versions Selection
function VersionsSection({ selectedVersion }: { selectedVersion?: string }) {
  const { data: versionsData, isLoading, error } = useVersions();

  if (isLoading) {
    return <VersionsLoading />;
  }

  if (error) {
    return (
      <Card className="border-destructive max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Bug className="h-5 w-5" />
            Error loading versions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-destructive text-sm">
            {error instanceof Error
              ? error.message
              : "An error occurred while fetching versions"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md space-y-3 flex flex-col items-center">
      <Label className="text-center block text-sm font-medium">
        React Native Version
      </Label>
      <div className="flex gap-3 items-center w-full">
        <div className="flex-1">
          <SearchForm
            versions={versionsData?.versions || []}
            defaultVersion={selectedVersion}
          />
        </div>
      </div>
    </div>
  );
}

function SearchPage() {
  const search = useSearch({ from: "/" });

  const version = search.version || "";
  const mainRepoPage = Number(search.mainRepoPage) || 1;
  const ecosystemPage = Number(search.ecosystemPage) || 1;
  const activeTab = search.activeTab || "main";
  const searchTriggered = search.search === "true";

  // TanStack Query handles caching and preloading automatically

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Search bugs for React Native version
            </h1>
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary/20 rounded-full blur-xs"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-accent/30 rounded-full blur-xs"></div>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover and track bugs across React Native versions
          </p>
        </div>

        {/* Version Selection */}
        <div className="mb-8 flex flex-col items-center">
          <VersionsSection selectedVersion={version} />
        </div>

        {/* Search Results */}
        {version && searchTriggered ? (
          <Suspense fallback={<SearchResultsLoading />}>
            <SearchResultsWithPagination
              version={version}
              mainRepoPage={mainRepoPage}
              ecosystemPage={ecosystemPage}
              activeTab={activeTab}
            />
          </Suspense>
        ) : version ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">
                    Click "Search bugs" to start searching for version{" "}
                    <strong>{version}</strong>
                  </p>
                  <Link
                    to="/"
                    search={{
                      version: version,
                      search: "true",
                      mainRepoPage: "1",
                      ecosystemPage: "1",
                      activeTab: "main",
                    }}
                    className="inline-block mt-2 text-primary hover:underline"
                  >
                    Start searching →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select a React Native version to start searching for bugs
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      version: search.version as string,
      mainRepoPage: search.mainRepoPage as string,
      ecosystemPage: search.ecosystemPage as string,
      activeTab: search.activeTab as string,
      search: search.search as string,
    };
  },
  component: SearchPage,
});
