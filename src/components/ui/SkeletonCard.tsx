import React from "react";

interface SkeletonCardProps {
  variant?: "card" | "table" | "list" | "profile" | "stat";
  rows?: number;
  className?: string;
}

/** Reusable skeleton line */
function Line({
  width = "w-full",
  height = "h-3",
}: {
  width?: string;
  height?: string;
}) {
  return <div className={`skeleton ${width} ${height}`} />;
}

/** Card skeleton — header + body */
function CardSkeleton({ rows = 3 }: { rows: number }) {
  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Line width="w-1/3" height="h-4" />
          <Line width="w-1/2" height="h-3" />
        </div>
      </div>
      {/* Body rows */}
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <Line key={i} width={i % 2 === 0 ? "w-full" : "w-4/5"} />
        ))}
      </div>
    </div>
  );
}

/** Table skeleton */
function TableSkeleton({ rows = 5 }: { rows: number }) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {[...Array(5)].map((_, i) => (
              <th key={i} className="table-th">
                <Line width="w-16" height="h-3" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, i) => (
            <tr key={i}>
              {[...Array(5)].map((_, j) => (
                <td key={j} className="table-td">
                  <Line
                    width={j === 0 ? "w-24" : j === 4 ? "w-16" : "w-full"}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** List skeleton */
function ListSkeleton({ rows = 4 }: { rows: number }) {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl border border-surface-border"
        >
          <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Line width="w-1/3" height="h-3" />
            <Line width="w-1/2" height="h-3" />
          </div>
          <Line width="w-16" height="h-3" />
        </div>
      ))}
    </div>
  );
}

/** Profile hero skeleton */
function ProfileSkeleton() {
  return (
    <div className="card">
      <div className="flex items-start gap-5">
        <div className="skeleton w-20 h-20 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Line width="w-1/3" height="h-5" />
          <Line width="w-1/4" height="h-3" />
          <div className="flex gap-2 mt-3">
            <div className="skeleton w-20 h-6 rounded-full" />
            <div className="skeleton w-24 h-6 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Stat card skeleton */
function StatSkeleton() {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <Line width="w-24" height="h-3" />
      </div>
      <Line width="w-1/2" height="h-7" />
      <Line width="w-1/3" height="h-3" />
    </div>
  );
}

export default function SkeletonCard({
  variant = "card",
  rows = 3,
  className = "",
}: SkeletonCardProps) {
  switch (variant) {
    case "table":
      return <TableSkeleton rows={rows} />;
    case "list":
      return <ListSkeleton rows={rows} />;
    case "profile":
      return <ProfileSkeleton />;
    case "stat":
      return <StatSkeleton />;
    case "card":
    default:
      return <CardSkeleton rows={rows} />;
  }
}