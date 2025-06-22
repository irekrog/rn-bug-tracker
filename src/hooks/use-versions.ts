import { useQuery } from "@tanstack/react-query";
import { fetchVersions } from "@/lib/api";

export function useVersions() {
  return useQuery({
    queryKey: ["versions"],
    queryFn: async () => {
      const response = await fetchVersions();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
  });
}
