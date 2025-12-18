import React, { FunctionComponent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit } from 'lucide-react'
import {
  ClientInvoiceData,
  subscriptionActions,
  userActions,
  UserDocument,
} from '@akademiasaas/shared'
import InvoiceDataInfo from '~/components/InvoiceDataInfo/InvoiceDataInfo'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import isEqual from 'lodash.isequal'
import { useSaveEntity } from '~/hooks/useSaveEntity'
import { useAppDispatch } from '~/initializeStore'
import InvoiceDataForm from '~/components/InvoiceDataForm/InvoiceFormData'

interface OwnProps {
  user: UserDocument
  showAsAlert?: boolean
}

type Props = OwnProps

const UserInvoiceData: FunctionComponent<Props> = ({ user, showAsAlert }) => {
  const { t } = useTranslation('subscription')
  const [showInvoiceForm, toggleInvoiceForm] = useState(false)
  const dispatch = useAppDispatch()
  const [loader, onSuccess, onFailure, onStart] = useSaveEntity(() => {
    toggleInvoiceForm(false)
  })

  const updateInvoiceData = async (data: ClientInvoiceData) => {
    if (isEqual(data, user.invoiceData)) {
      toggleInvoiceForm(false)
      return
    }
    onStart()

    try {
      await dispatch(
        userActions.updateUserData({
          invoiceData: data,
          uid: user.uid,
        })
      )
      dispatch(subscriptionActions.updateUserInvoiceData())
      onSuccess()
    } catch {
      onFailure()
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center">
        <Separator className="flex-1" />
        <span className="px-4 text-sm font-medium text-muted-foreground">
          {t<string>('invoice.title')}
        </span>
        <Separator className="flex-1" />
      </div>

      <div className="flex w-full justify-end">
        <Button onClick={() => toggleInvoiceForm(true)} className="gap-2">
          <Edit className="h-4 w-4" />
          {t<string>('common:button.edit')}
        </Button>
      </div>

      <InvoiceDataInfo invoiceData={user.invoiceData} withTitle={false} withAlert={showAsAlert} />

      <Dialog open={showInvoiceForm} onOpenChange={toggleInvoiceForm}>
        <DialogContent className="sm:max-w-[700px] h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('invoice.formTitle')}</DialogTitle>
          </DialogHeader>
          <InvoiceDataForm
            onSubmit={updateInvoiceData}
            onCancel={() => toggleInvoiceForm(false)}
            loading={!!loader}
            model={
              user.invoiceData
                ? user.invoiceData
                : user.country
                  ? { country: user.country, email: user.email }
                  : { email: user.email }
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserInvoiceData
