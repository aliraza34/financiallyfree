import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-base outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[#146c4326]",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
