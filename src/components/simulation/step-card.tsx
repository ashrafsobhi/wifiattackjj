import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle, Loader2, type LucideIcon } from "lucide-react";

export type Status = "pending" | "active" | "completed";

interface StepProps {
  stepNumber: number;
  title: string;
  command?: string;
  status: Status;
  Icon: LucideIcon;
  children: React.ReactNode;
  buttonText?: string;
  onButtonClick?: () => void;
  isButtonDisabled?: boolean;
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
  buttonText,
  onButtonClick,
  isButtonDisabled = false,
  isButtonLoading = false,
}: StepProps) {
  const config = statusConfig[status];
  const StatusIcon = status === "active" ? Loader2 : config.Icon;

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
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <Icon
              className={cn("h-6 w-6", config.textColor)}
              aria-hidden="true"
            />
          </div>
          <div className="flex-1">
            <CardTitle className="font-headline text-xl">
              <span className="text-muted-foreground/50 mr-2">{stepNumber}.</span>
              {title}
            </CardTitle>
            {command && (
              <CardDescription className="font-code mt-1 text-xs">
                {command}
              </CardDescription>
            )}
          </div>
          <StatusIcon
            className={cn("h-6 w-6", config.textColor, status === 'active' && "animate-spin")}
          />
        </CardHeader>
        {status !== "pending" && (
          <CardContent>
            <div className="space-y-4">{children}</div>
            {buttonText && status === "active" && (
              <div className="mt-6 border-t pt-4">
                <Button
                  onClick={onButtonClick}
                  disabled={isButtonDisabled || isButtonLoading}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  {isButtonLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {buttonText}
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
