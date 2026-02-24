import clsx from "clsx";

const colorMap: Record<string, string> = {
  mint: "bg-accent-mint-muted text-accent-mint border-accent-mint/20",
  cyan: "bg-accent-cyan-muted text-accent-cyan border-accent-cyan/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  gray: "bg-white/5 text-text-tertiary border-white/8",
};

export default function Badge({
  children,
  color = "gray",
  className,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border",
        colorMap[color] || colorMap.gray,
        className
      )}
    >
      {children}
    </span>
  );
}
