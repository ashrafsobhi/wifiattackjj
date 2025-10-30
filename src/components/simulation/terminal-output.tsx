import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TerminalOutputProps {
  children: React.ReactNode;
  className?: string;
}

export function TerminalOutput({ children, className }: TerminalOutputProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-black/70 p-4 font-code text-sm text-white/90 shadow-inner",
        className
      )}
    >
      <pre className="whitespace-pre-wrap">{children}</pre>
    </div>
  );
}
