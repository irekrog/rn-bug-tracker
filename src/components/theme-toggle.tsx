"use client";

import * as React from "react";
import { useTheme } from "@/components/theme-provider";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="flex items-center space-x-3 p-1">
      <Sun
        className={cn(
          "h-4 w-4 transition-colors",
          !isDark ? "text-yellow-500" : "text-muted-foreground"
        )}
      />
      <Switch
        isSelected={isDark}
        onChange={(isSelected: boolean) => {
          setTheme(isSelected ? "dark" : "light");
        }}
        aria-label="Toggle theme"
      />
      <Moon
        className={cn(
          "h-4 w-4 transition-colors",
          isDark ? "text-blue-400" : "text-muted-foreground"
        )}
      />
    </div>
  );
}
