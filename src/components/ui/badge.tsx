import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

function Badge({ className = "", ...props }: BadgeProps) {
  return (
    <div
      className={
        "inline-flex items-center rounded-full border border-gray-700 bg-gray-800 px-2.5 py-0.5 text-xs font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 " +
        className
      }
      {...props}
    />
  )
}

export { Badge }
