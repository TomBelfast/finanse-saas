import React, { FunctionComponent } from 'react'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'
import { cn } from '~/lib/utils'

interface FullPageAlertProps {
  type?: 'success' | 'info' | 'warning' | 'error'
  message?: React.ReactNode
  description?: React.ReactNode
  className?: string
}

const iconMap = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
}

const variantMap = {
  success: 'default',
  info: 'default',
  warning: 'default',
  error: 'destructive',
} as const

const FullPageAlert: FunctionComponent<FullPageAlertProps> = ({
  type = 'info',
  message,
  description,
  className,
}) => {
  const Icon = iconMap[type]
  const variant = variantMap[type]

  return (
    <div className="flex min-h-screen w-full flex-1 items-center justify-center">
      <Alert
        variant={variant}
        className={cn('w-full max-w-[500px] p-5', className)}
      >
        <Icon className="h-4 w-4" />
        {message && <AlertTitle>{message}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
      </Alert>
    </div>
  )
}

export default FullPageAlert
