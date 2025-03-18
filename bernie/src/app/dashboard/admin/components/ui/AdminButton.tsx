import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const adminButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-[#424242] text-white hover:bg-[#525252] active:bg-[#323232]",
        secondary: "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] active:bg-[#1a1a1a]",
        outline: "border border-[#424242] bg-transparent hover:bg-[#252525] text-white",
        ghost: "bg-transparent hover:bg-[#252525] text-white",
        destructive: "bg-red-900/80 text-white hover:bg-red-900 active:bg-red-950",
        success: "bg-green-900/80 text-white hover:bg-green-900 active:bg-green-950",
        link: "text-blue-400 underline-offset-4 hover:underline p-0 h-auto hover:text-blue-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-6",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface AdminButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof adminButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const AdminButton = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(adminButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);

AdminButton.displayName = "AdminButton"; 