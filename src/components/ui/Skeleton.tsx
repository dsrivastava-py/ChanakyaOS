import React from "react";

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gradient-to-r from-[#111827] via-[#1F2937] to-[#111827] bg-[length:400%_100%] animate-[shimmer_2s_infinite] ${className}`}
      {...props}
    />
  );
}
