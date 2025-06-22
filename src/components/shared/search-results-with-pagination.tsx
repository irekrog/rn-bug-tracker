import { useBugReports } from "@/hooks/use-bug-reports";
import { IssueCard } from "./issue-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  Calendar,
  ExternalLink,
  Bug,
  Globe,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { useNavigate, Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface SearchResultsWithPaginationProps {
  version: string;
  mainRepoPage?: number;
  ecosystemPage?: number;
  activeTab?: string;
}

// Helper function to generate pagination items
function generatePaginationItems(currentPage: number, totalPages: number) {
  const items = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages; i++) {
      items.push(i);
    }
  } else {
    // Always show first page
    items.push(1);

    if (currentPage > 3) {
      items.push("ellipsis-start");
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (!items.includes(i)) {
        items.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      items.push("ellipsis-end");
    }

    // Always show last page
    if (!items.includes(totalPages)) {
      items.push(totalPages);
    }
  }

  return items;
}

// Custom pagination components that work with TanStack Router
function CustomPagination({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center px-2", className)}
      {...props}
    />
  );
}

function CustomPaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn(
        "flex flex-row items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide",
        className
      )}
      {...props}
    />
  );
}

function CustomPaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li {...props} />;
}

interface CustomPaginationLinkProps {
  isActive?: boolean;
  disabled?: boolean;
  to: string;
  search: any;
  children: React.ReactNode;
  className?: string;
}

function CustomPaginationLink({
  isActive,
  disabled,
  to,
  search,
  children,
  className,
}: CustomPaginationLinkProps) {
  if (disabled) {
    return (
      <span
        className={cn(
          buttonVariants({
            variant: "ghost",
            size: "sm",
          }),
          "pointer-events-none opacity-50 h-8 px-2 sm:h-9 sm:px-3 text-sm min-w-[32px] sm:min-w-[36px] flex-shrink-0",
          className
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      to={to}
      search={search}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size: "sm",
        }),
        "h-8 px-2 sm:h-9 sm:px-3 text-sm min-w-[32px] sm:min-w-[36px] flex-shrink-0",
        className
      )}
    >
      {children}
    </Link>
  );
}

function CustomPaginationEllipsis({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center flex-shrink-0",
        className
      )}
    >
      <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export default function SearchResultsWithPagination({
  version,
  mainRepoPage = 1,
  ecosystemPage = 1,
  activeTab = "main",
}: SearchResultsWithPaginationProps) {
  const navigate = useNavigate();
  const {
    data: results,
    isLoading,
    error,
  } = useBugReports(version, mainRepoPage, ecosystemPage);

  if (!version) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Select a React Native version to see search results.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading bug reports...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Bug className="h-5 w-5" />
            Search Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-destructive">
            {error instanceof Error
              ? error.message
              : "An error occurred during search"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            No results for version {version}.
          </p>
        </CardContent>
      </Card>
    );
  }

  const mainRepoTotalPages = Math.ceil(results.mainRepoIssues.total_count / 20);
  const ecosystemTotalPages = Math.ceil(
    results.ecosystemIssues.total_count / 20
  );

  // Helper function to create pagination search params
  const createPaginationSearch = (
    page: number,
    isEcosystem: boolean = false
  ) => ({
    version,
    search: "true",
    activeTab,
    mainRepoPage: isEcosystem ? mainRepoPage.toString() : page.toString(),
    ecosystemPage: isEcosystem ? page.toString() : ecosystemPage.toString(),
  });

  return (
    <div className="space-y-6">
      {/* Release Information */}
      {results.release && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Release Information
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Version</p>
                <p className="font-medium">
                  {results.release.name || results.release.tag_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Release Date</p>
                <p className="font-medium">
                  {results.release.published_at
                    ? formatDate(results.release.published_at)
                    : "Unknown date"}
                  <span className="text-sm text-muted-foreground ml-2">
                    (
                    {results.release.published_at
                      ? formatRelativeTime(results.release.published_at)
                      : "Unknown date"}
                    )
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-4">
              <a
                href={results.release.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                View release on GitHub
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Found a total of{" "}
              <strong>
                {results.mainRepoIssues.total_count +
                  results.ecosystemIssues.total_count}
              </strong>{" "}
              issues related to React Native {results.version}
            </p>
            {results.searchedAfterDate && (
              <p className="mt-1">
                Search limited to issues reported after{" "}
                {formatDate(results.searchedAfterDate)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Bug Reports
          </CardTitle>
          <CardDescription>
            Issues from React Native main repository and ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => {
              navigate({
                to: "/",
                search: (prev: any) => ({
                  ...prev,
                  activeTab: key as string,
                }),
              });
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger id="main" className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Main Repository
                <Badge variant="secondary" className="ml-1">
                  {results.mainRepoIssues.total_count}
                </Badge>
              </TabsTrigger>
              <TabsTrigger id="ecosystem" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Ecosystem
                <Badge variant="secondary" className="ml-1">
                  {results.ecosystemIssues.total_count}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent id="main" className="mt-6">
              <div className="space-y-6">
                {results.mainRepoIssues.items.length > 0 ? (
                  <div className="space-y-4">
                    {results.mainRepoIssues.items.map((issue) => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bug className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No issues found in the main repository for this version.
                    </p>
                  </div>
                )}

                {/* Main Repository Pagination */}
                {mainRepoTotalPages > 1 && (
                  <CustomPagination>
                    <CustomPaginationContent>
                      <CustomPaginationItem>
                        <CustomPaginationLink
                          to="/"
                          search={createPaginationSearch(mainRepoPage - 1)}
                          disabled={mainRepoPage <= 1}
                          className="gap-1 px-2 sm:px-2.5 sm:pl-2.5 h-8 sm:h-9 min-w-[40px] sm:min-w-[80px] justify-center text-sm flex-shrink-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="hidden sm:block">Previous</span>
                        </CustomPaginationLink>
                      </CustomPaginationItem>

                      {generatePaginationItems(
                        mainRepoPage,
                        mainRepoTotalPages
                      ).map((item, index) => (
                        <CustomPaginationItem key={index}>
                          {item === "ellipsis-start" ||
                          item === "ellipsis-end" ? (
                            <CustomPaginationEllipsis />
                          ) : (
                            <CustomPaginationLink
                              to="/"
                              search={createPaginationSearch(item as number)}
                              isActive={mainRepoPage === item}
                            >
                              {item}
                            </CustomPaginationLink>
                          )}
                        </CustomPaginationItem>
                      ))}

                      <CustomPaginationItem>
                        <CustomPaginationLink
                          to="/"
                          search={createPaginationSearch(mainRepoPage + 1)}
                          disabled={mainRepoPage >= mainRepoTotalPages}
                          className="gap-1 px-2 sm:px-2.5 sm:pr-2.5 h-8 sm:h-9 min-w-[40px] sm:min-w-[80px] justify-center text-sm flex-shrink-0"
                        >
                          <span className="hidden sm:block">Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </CustomPaginationLink>
                      </CustomPaginationItem>
                    </CustomPaginationContent>
                  </CustomPagination>
                )}
              </div>
            </TabsContent>

            <TabsContent id="ecosystem" className="mt-6">
              <div className="space-y-6">
                {results.ecosystemIssues.items.length > 0 ? (
                  <div className="space-y-4">
                    {results.ecosystemIssues.items.map((issue) => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No ecosystem issues found for this version.
                    </p>
                  </div>
                )}

                {/* Ecosystem Pagination */}
                {ecosystemTotalPages > 1 && (
                  <CustomPagination>
                    <CustomPaginationContent>
                      <CustomPaginationItem>
                        <CustomPaginationLink
                          to="/"
                          search={createPaginationSearch(
                            ecosystemPage - 1,
                            true
                          )}
                          disabled={ecosystemPage <= 1}
                          className="gap-1 px-2 sm:px-2.5 sm:pl-2.5 h-8 sm:h-9 min-w-[40px] sm:min-w-[80px] justify-center text-sm flex-shrink-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="hidden sm:block">Previous</span>
                        </CustomPaginationLink>
                      </CustomPaginationItem>

                      {generatePaginationItems(
                        ecosystemPage,
                        ecosystemTotalPages
                      ).map((item, index) => (
                        <CustomPaginationItem key={index}>
                          {item === "ellipsis-start" ||
                          item === "ellipsis-end" ? (
                            <CustomPaginationEllipsis />
                          ) : (
                            <CustomPaginationLink
                              to="/"
                              search={createPaginationSearch(
                                item as number,
                                true
                              )}
                              isActive={ecosystemPage === item}
                            >
                              {item}
                            </CustomPaginationLink>
                          )}
                        </CustomPaginationItem>
                      ))}

                      <CustomPaginationItem>
                        <CustomPaginationLink
                          to="/"
                          search={createPaginationSearch(
                            ecosystemPage + 1,
                            true
                          )}
                          disabled={ecosystemPage >= ecosystemTotalPages}
                          className="gap-1 px-2 sm:px-2.5 sm:pr-2.5 h-8 sm:h-9 min-w-[40px] sm:min-w-[80px] justify-center text-sm flex-shrink-0"
                        >
                          <span className="hidden sm:block">Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </CustomPaginationLink>
                      </CustomPaginationItem>
                    </CustomPaginationContent>
                  </CustomPagination>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
