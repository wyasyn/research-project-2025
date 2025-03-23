import { CheckIcon } from "lucide-react";
import { Button } from "./ui/button";

interface StepsProps {
  currentStep: number;
}

export function Steps({ currentStep }: StepsProps) {
  const steps = [
    { id: 1, name: "Organization" },
    { id: 2, name: "Admin" },
    { id: 3, name: "Profile Image" },
    { id: 4, name: "Complete" },
  ];

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center gap-4 justify-between">
        {steps.map((step) => (
          <li key={step.name} className="flex items-center gap-2">
            <Button
              size={"icon"}
              className={
                step.id === currentStep
                  ? "bg-primary text-white"
                  : step.id < currentStep
                  ? "bg-primary/35 text-primary"
                  : "bg-background text-muted-foreground"
              }
            >
              {step.id < currentStep ? (
                <CheckIcon size={16} />
              ) : (
                <span>{step.id}</span>
              )}
            </Button>
            {step.id === currentStep && (
              <span className="text-xs">{step.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
