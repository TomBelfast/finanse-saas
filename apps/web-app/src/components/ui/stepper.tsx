import React from 'react';
import { cn } from '~/lib/utils';
import { Check } from 'lucide-react';

interface StepperProps {
    current: number;
    steps: {
        title: string;
        description?: string;
    }[];
    className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ current, steps, className }) => {
    return (
        <div className={cn("flex w-full items-center justify-between", className)}>
            {steps.map((step, index) => {
                const isCompleted = index < current;
                const isCurrent = index === current;
                const isLast = index === steps.length - 1;

                return (
                    <React.Fragment key={index}>
                        <div className="flex flex-col items-center relative z-10">
                            <div
                                className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-300 bg-background",
                                    isCompleted && "border-primary bg-primary text-primary-foreground",
                                    isCurrent && "border-primary text-primary",
                                    !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <span className="text-sm font-medium">{index + 1}</span>
                                )}
                            </div>
                            <div className="absolute top-10 w-32 text-center -ml-12">
                                <div className={cn(
                                    "text-xs font-medium transition-colors duration-300",
                                    (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                                )}>
                                    {step.title}
                                </div>
                            </div>
                        </div>

                        {!isLast && (
                            <div className="flex-1 h-[2px] mx-2 relative -top-3">
                                <div className="absolute inset-0 bg-muted-foreground/20" />
                                <div
                                    className="absolute inset-0 bg-primary transition-all duration-300"
                                    style={{ width: isCompleted ? '100%' : '0%' }}
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};
