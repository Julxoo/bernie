import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98] focus:outline-none focus-visible:outline-offset-2 focus-visible:outline-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 sm:h-10 px-3 sm:px-4 py-2 text-xs sm:text-sm has-[>svg]:px-2.5 sm:has-[>svg]:px-3",
        sm: "h-7 sm:h-8 rounded-md gap-1 sm:gap-1.5 px-2 sm:px-3 text-xs has-[>svg]:px-2 sm:has-[>svg]:px-2.5",
        lg: "h-10 sm:h-11 md:h-12 rounded-md px-4 sm:px-5 md:px-6 text-sm sm:text-base has-[>svg]:px-3 sm:has-[>svg]:px-4",
        xl: "h-12 sm:h-14 rounded-md px-5 sm:px-8 text-base sm:text-lg has-[>svg]:px-4 sm:has-[>svg]:px-6",
        icon: "h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-md",
      },
      fullWidth: {
        true: "w-full",
      },
      responsive: {
        true: "text-xs sm:text-sm md:text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      responsive: false,
    },
  }
)

interface ButtonProps extends React.ComponentProps<"button">,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({
  className,
  variant,
  size,
  fullWidth,
  responsive,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : "button"}
      className={cn(buttonVariants({ variant, size, fullWidth, responsive, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants, type ButtonProps }
