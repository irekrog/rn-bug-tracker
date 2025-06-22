import * as React from "react";
import { Button as AriaButton } from "react-aria-components";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 data-[pressed]:bg-primary/80",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 data-[pressed]:bg-destructive/80",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground data-[pressed]:bg-accent/80",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 data-[pressed]:bg-secondary/70",
        ghost:
          "hover:bg-accent hover:text-accent-foreground data-[pressed]:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline data-[pressed]:text-primary/80",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ComponentProps<typeof AriaButton>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<
  React.ComponentRef<typeof AriaButton>,
  ButtonProps
>(({ className, variant, size, ...props }, ref) => {
  return (
    <AriaButton
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
