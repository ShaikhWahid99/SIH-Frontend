import { Check } from 'lucide-react';

interface Step {
  label: string;
  completed?: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export const Stepper = ({ steps, currentStep }: StepperProps) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              {index > 0 && (
                <div
                  className={`h-1 flex-1 transition-all ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  index < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStep
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 transition-all ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
            <span className="text-xs mt-2 text-center hidden md:block">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
