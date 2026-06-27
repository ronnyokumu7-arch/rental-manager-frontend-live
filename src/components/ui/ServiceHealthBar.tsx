"use client";

interface ServiceHealthBarProps {
  current_mileage: number;
  next_service_km?: number | null;
}

export default function ServiceHealthBar({ current_mileage, next_service_km }: ServiceHealthBarProps) {
  if (!next_service_km) {
    return <span className="text-xs text-ink-subtle">Not set</span>;
  }

  const remaining = next_service_km - current_mileage;
  const total = next_service_km;
  const percent = Math.max(0, Math.min(100, (remaining / total) * 100));

  let color = "bg-success";
  let label = "Good";
  
  if (remaining <= 0) {
    color = "bg-danger";
    label = "Overdue";
  } else if (percent < 20) {
    color = "bg-warning";
    label = "Due Soon";
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium text-ink-muted">{label}</span>
        <span className="text-[10px] text-ink-subtle">{remaining.toLocaleString()} km left</span>
      </div>
      <div className="w-full h-1.5 bg-surface-hover rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
