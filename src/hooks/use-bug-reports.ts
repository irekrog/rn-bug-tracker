import { useQuery } from "@tanstack/react-query";
import { fetchBugReports } from "@/lib/api";

export function useBugReports(
  version: string,
  mainRepoPage: number = 1,
  ecosystemPage: number = 1
) {
  return useQuery({
    queryKey: ["bug-reports", version, mainRepoPage, ecosystemPage],
    queryFn: async () => {
      const response = await fetchBugReports(
        version,
        mainRepoPage,
        ecosystemPage
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!version,
  });
}
