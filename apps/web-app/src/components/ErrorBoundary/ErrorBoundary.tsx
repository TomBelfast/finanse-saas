import React, { Component, ErrorInfo } from 'react'
import * as Sentry from '@sentry/react'
import { WithTranslation, withTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { AlertCircle } from 'lucide-react'

type State = {
  eventId: null | string
  hasError: boolean
  visible: boolean
}

class ErrorBoundary extends Component<WithTranslation, State> {
  state = {
    eventId: null,
    hasError: false,
    visible: true,
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setExtras({ errorInfo })
      const eventId = Sentry.captureException(error)
      this.setState({ eventId })
    })
  }

  refreshPage() {
    window.location.reload()
  }

  render() {
    const { t } = this.props
    const { hasError, eventId, visible } = this.state
    if (hasError) {
      return (
        <Dialog open={visible} onOpenChange={(open) => this.setState({ visible: open })}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                {t<string>('appError')}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t<string>('appError')}</AlertTitle>
                <AlertDescription>
                  {t<string>('appErrorDescription')}
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={this.refreshPage}>
                {t<string>('button.refreshPage')}
              </Button>
              <Button
                onClick={() => {
                  this.setState({ visible: false })
                  Sentry.showReportDialog({ eventId: eventId || '' })
                }}
              >
                {t<string>('button.sendFeedback')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    }

    // @ts-ignore
    return this.props.children
  }
}

export default withTranslation('common')(ErrorBoundary)
