"use client";

interface BinUtilizationBadgeProps {
  utilizationPercent: number;
  currentCount: number;
  capacity: number;
}

export function BinUtilizationBadge({
  utilizationPercent,
  currentCount,
  capacity,
}: BinUtilizationBadgeProps) {
  const color =
    utilizationPercent >= 90
      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      : utilizationPercent >= 75
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full rounded-full transition-all ${color}`}
            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
          />
        </div>
      </div>
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
        {utilizationPercent.toFixed(0)}% ({currentCount}/{capacity})
      </span>
    </div>
  );
}
