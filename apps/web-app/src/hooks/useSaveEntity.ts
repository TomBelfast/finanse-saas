import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function useSaveEntity(
  successCallback?: () => void
): [boolean | string, () => void, () => void, (id?: string) => void, () => void] {
  const [loading, toggleLoader] = useState<boolean | string>(false)
  const { t } = useTranslation('common')
  let loadingToastId: string | number | undefined

  const onStart = (id?: string, loadingMessage = t<string>('messages.loading.default')) => {
    toggleLoader(id ?? true)
    loadingToastId = toast.loading(loadingMessage)
  }

  const onSuccess = (successMessage = t<string>('messages.success.default')) => {
    toggleLoader(false)
    if (loadingToastId) {
      toast.dismiss(loadingToastId)
    }
    toast.success(successMessage)
    successCallback?.()
  }

  const onFailure = (errorMessage = t<string>('messages.error.default')) => {
    toggleLoader(false)
    if (loadingToastId) {
      toast.dismiss(loadingToastId)
    }
    toast.error(errorMessage)
  }

  const onEnd = () => {
    toggleLoader(false)
    if (loadingToastId) {
      toast.dismiss(loadingToastId)
    }
  }

  return [loading, onSuccess, onFailure, onStart, onEnd]
}
