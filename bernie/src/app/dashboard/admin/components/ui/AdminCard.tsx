import * as React from "react";
import { cn } from "@/lib/utils";

type AdminCardProps = React.HTMLAttributes<HTMLDivElement> & {
  gradient?: boolean;
};

export const AdminCard = React.forwardRef<HTMLDivElement, AdminCardProps>(
  ({ className, gradient = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border bg-[#171717] border-[#323232] text-white shadow-md overflow-hidden",
        gradient && "bg-gradient-to-br from-[#1a1a1a] to-[#232323]",
        className
      )}
      {...props}
    />
  )
);
AdminCard.displayName = "AdminCard";

export const AdminCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1 p-5 border-b border-[#323232]", className)}
    {...props}
  />
));
AdminCardHeader.displayName = "AdminCardHeader";

export const AdminCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold text-lg leading-none tracking-tight", className)}
    {...props}
  />
));
AdminCardTitle.displayName = "AdminCardTitle";

export const AdminCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-gray-400", className)}
    {...props}
  />
));
AdminCardDescription.displayName = "AdminCardDescription";

export const AdminCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5", className)} {...props} />
));
AdminCardContent.displayName = "AdminCardContent";

export const AdminCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-5 border-t border-[#323232] bg-[#1a1a1a]", className)}
    {...props}
  />
));
AdminCardFooter.displayName = "AdminCardFooter"; 