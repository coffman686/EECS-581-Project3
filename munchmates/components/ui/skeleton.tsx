// munchmates/components/ui/skeleton.tsx
// Provides:
// - <Skeleton>: a versatile skeleton component for loading states
// Used throughout the app for consistent skeleton display.

import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
