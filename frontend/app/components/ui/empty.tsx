import { Inbox } from "lucide-react";

export default function Empty({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/3 border border-border-subtle flex items-center justify-center mb-5">
        <Inbox size={24} className="text-text-tertiary" />
      </div>
      <p className="text-[15px] text-text-secondary font-medium">{title}</p>
      {description && (
        <p className="text-[13px] text-text-tertiary mt-1.5 max-w-[280px] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
