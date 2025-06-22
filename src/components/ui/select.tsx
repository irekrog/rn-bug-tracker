"use client";

import * as React from "react";
import {
  Button,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue as AriaSelectValue,
} from "react-aria-components";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Main Select component with proper accessibility
const Select = React.forwardRef<
  React.ComponentRef<typeof AriaSelect>,
  React.ComponentPropsWithoutRef<typeof AriaSelect> & {
    "aria-label"?: string;
    "aria-labelledby"?: string;
  }
>(
  (
    {
      className,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      ...props
    },
    ref
  ) => (
    <AriaSelect
      ref={ref}
      className={cn("group flex flex-col gap-1", className)}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      {...props}
    />
  )
);
Select.displayName = "Select";

// Label component
const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

// Trigger Button component
const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, children, ...props }, ref) => (
  <Button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
      "placeholder:text-muted-foreground",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[pressed]:bg-accent/50",
      "hover:bg-accent/10 transition-colors duration-200 ease-out",
      "[&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {typeof children === "function" ? (
      children
    ) : (
      <>
        {children}
        <ChevronDown
          className="h-4 w-4 opacity-50 transition-all duration-200 ease-out group-data-[open]:rotate-180 group-data-[open]:opacity-70"
          aria-hidden="true"
        />
      </>
    )}
  </Button>
));
SelectTrigger.displayName = "SelectTrigger";

// SelectValue component
const SelectValue = React.forwardRef<
  React.ComponentRef<typeof AriaSelectValue>,
  React.ComponentPropsWithoutRef<typeof AriaSelectValue>
>(({ className, ...props }, ref) => (
  <AriaSelectValue
    ref={ref}
    className={cn(
      "data-[placeholder]:text-muted-foreground data-[placeholder]:font-normal",
      "transition-colors duration-200 ease-out",
      className
    )}
    {...props}
  />
));
SelectValue.displayName = "SelectValue";

// Popover content component with optimized animations
const SelectContent = React.forwardRef<
  React.ComponentRef<typeof Popover>,
  React.ComponentPropsWithoutRef<typeof Popover>
>(({ className, children, ...props }, ref) => (
  <Popover
    ref={ref}
    className={cn(
      "relative z-50 min-w-[var(--trigger-width)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg",
      // Simplified and optimized animations
      "data-[entering]:opacity-0 data-[entering]:scale-95 data-[entering]:animate-in",
      "data-[exiting]:opacity-100 data-[exiting]:scale-100 data-[exiting]:animate-out",
      "data-[entering]:duration-200 data-[exiting]:duration-150",
      // Performance optimizations
      "will-change-[opacity,transform] backface-hidden",
      className
    )}
    {...props}
  >
    <ListBox
      className={cn(
        "max-h-60 overflow-auto p-1 outline-none",
        // Smooth scrolling with better performance
        "scroll-smooth overscroll-contain",
        // Custom scrollbar
        "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/20 [&::-webkit-scrollbar-thumb]:rounded-full"
      )}
    >
      {children}
    </ListBox>
  </Popover>
));
SelectContent.displayName = "SelectContent";

// ListBox Item component with textValue support
const SelectItem = React.forwardRef<
  React.ComponentRef<typeof ListBoxItem>,
  React.ComponentPropsWithoutRef<typeof ListBoxItem> & {
    textValue?: string;
  }
>(({ className, children, textValue, ...props }, ref) => {
  // Auto-generate textValue from children if not provided
  const computedTextValue =
    textValue || (typeof children === "string" ? children : undefined);

  return (
    <ListBoxItem
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        // Optimized hover and focus states
        "transition-colors duration-150 ease-out",
        "hover:bg-accent/50 hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[focused]:bg-accent data-[focused]:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        // Selected state with better visual feedback
        "data-[selected]:bg-accent/80 data-[selected]:text-accent-foreground",
        "data-[selected]:font-medium",
        // Optimized checkmark
        "data-[selected]:before:content-['✓'] data-[selected]:before:absolute data-[selected]:before:left-2 data-[selected]:before:top-1/2 data-[selected]:before:-translate-y-1/2",
        "data-[selected]:before:transition-opacity data-[selected]:before:duration-150 data-[selected]:before:ease-out",
        "data-[selected]:before:text-accent-foreground data-[selected]:before:font-semibold",
        className
      )}
      textValue={computedTextValue}
      {...props}
    >
      {children}
    </ListBoxItem>
  );
});
SelectItem.displayName = "SelectItem";

// Separator component for sections
const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectSeparator,
};
