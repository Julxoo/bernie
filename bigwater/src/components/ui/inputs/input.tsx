import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, "aria-describedby": ariaDescribedby, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = props.id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = error 
      ? `${ariaDescribedby ? `${ariaDescribedby} ` : ''}${errorId}`
      : ariaDescribedby;

    return (
      <div className="relative w-full">
        <input
          type={type}
          id={inputId}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            error ? "border-destructive focus-visible:ring-destructive/20" : "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className
          )}
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {error && (
          <div
            id={errorId}
            className="text-destructive text-xs mt-1"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
