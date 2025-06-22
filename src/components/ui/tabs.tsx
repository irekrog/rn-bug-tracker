"use client";

import * as React from "react";
import {
  Tabs as AriaTabs,
  TabList,
  Tab,
  TabPanel,
} from "react-aria-components";
import { cn } from "@/lib/utils";

// Main Tabs component
const Tabs = React.forwardRef<
  React.ComponentRef<typeof AriaTabs>,
  React.ComponentPropsWithoutRef<typeof AriaTabs>
>(({ className, ...props }, ref) => (
  <AriaTabs ref={ref} className={cn("flex flex-col", className)} {...props} />
));
Tabs.displayName = "Tabs";

// TabList component
const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabList>,
  React.ComponentPropsWithoutRef<typeof TabList>
>(({ className, ...props }, ref) => (
  <TabList
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

// Tab component (trigger)
const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof Tab>,
  React.ComponentPropsWithoutRef<typeof Tab>
>(({ className, ...props }, ref) => (
  <Tab
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm",
      "data-[hovered]:bg-background/50 data-[hovered]:text-foreground",
      "data-[pressed]:bg-background/80",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

// TabPanel component (content)
const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabPanel>,
  React.ComponentPropsWithoutRef<typeof TabPanel>
>(({ className, ...props }, ref) => (
  <TabPanel
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
