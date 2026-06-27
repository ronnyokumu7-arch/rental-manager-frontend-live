import React from "react";
import Image from "next/image";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarStatus = "online" | "offline" | "away" | "busy";

interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: AvatarSize;
  status?: AvatarStatus;
  shape?: "circle" | "rounded";
  className?: string;
}

const sizeMap: Record<AvatarSize, { container: string; text: string; dot: string }> = {
  xs: { container: "w-6 h-6",   text: "text-[10px]", dot: "w-1.5 h-1.5 border" },
  sm: { container: "w-8 h-8",   text: "text-xs",     dot: "w-2 h-2 border" },
  md: { container: "w-10 h-10", text: "text-sm",     dot: "w-2.5 h-2.5 border-2" },
  lg: { container: "w-12 h-12", text: "text-base",   dot: "w-3 h-3 border-2" },
  xl: { container: "w-16 h-16", text: "text-xl",     dot: "w-3.5 h-3.5 border-2" },
};

// Semantic status colors
const statusColors: Record<AvatarStatus, string> = {
  online:  "bg-success ring-2 ring-surface-card",
  offline: "bg-ink-subtle ring-2 ring-surface-card",
  away:    "bg-warning ring-2 ring-surface-card",
  busy:    "bg-danger ring-2 ring-surface-card",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getGradient(name: string) {
  const gradients = [
    "from-[#1e6fba] to-[#64b5f6]",
    "from-[#7c3aed] to-[#a78bfa]",
    "from-[#0891b2] to-[#67e8f9]",
    "from-[#15803d] to-[#86efac]",
    "from-[#b45309] to-[#fcd34d]",
    "from-[#be185d] to-[#f9a8d4]",
    "from-[#1d4ed8] to-[#93c5fd]",
  ];
  const index = name ? name.charCodeAt(0) % gradients.length : 0;
  return gradients[index];
}

export default function Avatar({
  name = "User",
  src,
  size = "md",
  status,
  shape = "circle",
  className = "",
}: AvatarProps) {
  const { container, text, dot } = sizeMap[size];
  const radius = shape === "circle" ? "rounded-full" : "rounded-xl";
  const gradient = getGradient(name);
  const sizeNum = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 }[size];

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src ? (
        <div className={`${container} ${radius} overflow-hidden`}>
          <Image
            src={src}
            alt={name}
            width={sizeNum}
            height={sizeNum}
            className="object-cover w-full h-full"
          />
        </div>
      ) : (
        <div
          className={`${container} ${radius} ${text} bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-semibold select-none`}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0
            ${dot} ${statusColors[status]} 
            ${radius === "rounded-full" ? "rounded-full" : "rounded-full"}
          `}
        />
      )}
    </div>
  );
}

// ── Avatar Group ─────────────────────────────────────────────────────────────

interface AvatarGroupProps {
  users: { name: string; src?: string | null }[];
  max?: number;
  size?: AvatarSize;
}

export function AvatarGroup({ users, max = 4, size = "sm" }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const remaining = users.length - max;
  const { container, text } = sizeMap[size];

  return (
    <div className="flex items-center">
      {visible.map((user, i) => (
        <div
          key={i}
          className="relative"
          style={{ marginLeft: i === 0 ? 0 : "-8px", zIndex: visible.length - i }}
        >
          <Avatar
            name={user.name}
            src={user.src}
            size={size}
            className="ring-2 ring-surface-card dark:ring-[#18181b]"
          />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`relative ${container} rounded-full bg-surface-hover dark:bg-[#27272a] flex items-center justify-center ${text} font-medium text-ink-muted ring-2 ring-surface-card dark:ring-[#18181b]`}
          style={{ marginLeft: "-8px", zIndex: 0 }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
