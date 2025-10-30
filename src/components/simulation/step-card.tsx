import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle, Loader2, type LucideIcon, Terminal } from "lucide-react";
import { Input } from "../ui/input";

export type Status = "pending" | "active" | "completed";

interface StepProps {
  stepNumber: number;
  title: string;
  command?: string;
  status: Status;
  Icon: LucideIcon;
  children: React.ReactNode;
  onCommandSubmit?: (command: string) => void;
  isButtonLoading?: boolean;
}

const statusConfig = {
  pending: {
    Icon: Circle,
    borderColor: "border-muted/20",
    textColor: "text-muted-foreground/50",
    bgColor: "bg-card/30 backdrop-blur-sm",
    contentVisibility: "hidden",
  },
  active: {
    Icon: Loader2,
    borderColor: "border-primary/50",
    textColor: "text-primary",
    bgColor: "bg-card",
    contentVisibility: "visible",
  },
  completed: {
    Icon: CheckCircle,
    borderColor: "border-green-500/30",
    textColor: "text-green-500",
    bgColor: "bg-card/80",
    contentVisibility: "visible",
  },
};

export function StepCard({
  stepNumber,
  title,
  command,
  status,
  Icon,
  children,
  onCommandSubmit,
  isButtonLoading = false,
}: StepProps) {
  const [inputValue, setInputValue] = useState("");
  const config = statusConfig[status];
  const StatusIcon = status === 'active' ? config.Icon : config.Icon;


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCommandSubmit) {
      onCommandSubmit(inputValue);
    }
  };

  const isCrackingStep = stepNumber === 7;

  return (
    <div className="relative">
      <div
        className={cn(
          "absolute -inset-px rounded-lg border-2",
          config.borderColor,
          status === 'active' && 'animate-pulse'
        )}
        aria-hidden="true"
      ></div>
      <Card
        className={cn(
          "transition-all duration-500",
          config.bgColor,
          status === "pending" && "blur-[1px] saturate-0"
        )}
      >
        <CardHeader className="flex flex-row items-start md:items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary shrink-0 mt-1 md:mt-0">
            <Icon
              className={cn("h-6 w-6", config.textColor)}
              aria-hidden="true"
            />
          </div>
          <div className="flex-1">
            <CardTitle className="font-headline text-lg md:text-xl">
              <span className="text-muted-foreground/50 ml-2">{stepNumber}.</span>
              {title}
            </CardTitle>
            {command && (
              <CardDescription className="font-code mt-1 text-xs text-left break-all" dir="ltr">
                {command}
              </CardDescription>
            )}
          </div>
          <StatusIcon
            className={cn("h-6 w-6 shrink-0", config.textColor, status === 'active' && isButtonLoading && "animate-spin")}
          />
        </CardHeader>
        {status !== "pending" && (
          <CardContent>
            <div className="space-y-4">{children}</div>
            {onCommandSubmit && status === "active" && (
              <form onSubmit={handleSubmit} className="mt-6 border-t pt-4">
                <div className="relative">
                  <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="اكتب الأمر هنا واضغط Enter"
                    className="font-code pl-10"
                    autoComplete="off"
                    disabled={isButtonLoading}
                  />
                </div>
                {isCrackingStep && (
                  <Button type="submit" disabled={isButtonLoading} className="mt-2 w-full">
                    {isButtonLoading ? "جاري الاختراق..." : "ابدأ الاختراق"}
                  </Button>
                )}
              </form>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
