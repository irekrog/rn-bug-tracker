import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";

interface Version {
  tag: string;
  name: string;
  version: string;
  published_at: string;
}

interface SearchFormProps {
  versions: Version[];
  defaultVersion?: string;
  isLoading?: boolean;
}

export function SearchForm({
  versions,
  defaultVersion,
  isLoading,
}: SearchFormProps) {
  const navigate = useNavigate();

  const handleVersionChange = (version: string) => {
    // Navigate to search page with the selected version
    if (!version) {
      throw new Error("React Native version is required");
    }
    navigate({
      to: "/",
      search: {
        version: version,
        search: "true",
        mainRepoPage: "1",
        ecosystemPage: "1",
        activeTab: "main",
      },
    });
  };

  return (
    <Select
      defaultSelectedKey={defaultVersion}
      isDisabled={isLoading}
      onSelectionChange={(key) => handleVersionChange(key as string)}
      placeholder={isLoading ? "Loading versions..." : "Select version"}
      aria-label="Select React Native version"
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {versions.map((versionInfo) => {
          const displayText = `${versionInfo.version} (${formatDate(versionInfo.published_at)})`;
          return (
            <SelectItem
              key={versionInfo.tag}
              id={versionInfo.version}
              textValue={displayText}
            >
              {displayText}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
