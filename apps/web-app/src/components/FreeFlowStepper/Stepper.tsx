import React, { FunctionComponent } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '~/lib/utils'
import { Check } from 'lucide-react'

interface OwnProps {
  current: number
}

type Props = OwnProps

interface StepProps {
  title: string
  isActive: boolean
  isCompleted: boolean
  stepNumber: number
}

const Step = ({ title, isActive, isCompleted, stepNumber }: StepProps) => (
  <div className="flex flex-col items-center">
    <div
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
        isCompleted && 'border-primary bg-primary text-primary-foreground',
        isActive && !isCompleted && 'border-primary bg-primary/10 text-primary',
        !isActive && !isCompleted && 'border-muted-foreground/30 text-muted-foreground'
      )}
    >
      {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
    </div>
    <span
      className={cn(
        'mt-2 text-xs font-medium',
        isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
      )}
    >
      {title}
    </span>
  </div>
)

const StepConnector = ({ isCompleted }: { isCompleted: boolean }) => (
  <div
    className={cn(
      'mx-2 h-0.5 flex-1 transition-colors',
      isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
    )}
  />
)

const FreeFlowStepper: FunctionComponent<Props> = ({ current = 0 }) => {
  const { t } = useTranslation('checkout')

  const steps = [
    t<string>('stepper.data'),
    t<string>('stepper.confirm'),
    t<string>('stepper.accessFree'),
  ]

  return (
    <div className="flex w-full items-center justify-between">
      {steps.map((title, index) => (
        <React.Fragment key={index}>
          <Step
            title={title}
            isActive={index === current}
            isCompleted={index < current}
            stepNumber={index + 1}
          />
          {index < steps.length - 1 && (
            <StepConnector isCompleted={index < current} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default FreeFlowStepper
