import clsx from "clsx";

const colorMap: Record<string, string> = {
  mint: "bg-accent-mint-muted text-accent-mint",
  cyan: "bg-accent-cyan-muted text-accent-cyan",
  red: "bg-red-500/10 text-red-400",
  yellow: "bg-yellow-500/10 text-yellow-400",
  gray: "bg-white/5 text-text-tertiary",
};

export default function Badge({ children, color = "gray", className }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md", colorMap[color] || colorMap.gray, className)}>
      {children}
    </span>
  );
}
