"use client";

import * as React from "react";
import { Label as AriaLabel } from "react-aria-components";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  React.ElementRef<typeof AriaLabel>,
  React.ComponentPropsWithoutRef<typeof AriaLabel>
>(({ className, ...props }, ref) => (
  <AriaLabel
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
