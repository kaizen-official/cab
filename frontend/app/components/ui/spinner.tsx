import { Loader2 } from "lucide-react";

export default function Spinner({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className || ""}`}>
      <Loader2 size={20} className="animate-spin text-text-tertiary" />
    </div>
  );
}
