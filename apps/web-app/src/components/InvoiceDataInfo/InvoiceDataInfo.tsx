import React, { FunctionComponent } from 'react'
import { COUNTRIES, ClientInvoiceData } from '@akademiasaas/shared'
import { Alert, AlertTitle, AlertDescription } from '~/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'

interface OwnProps {
  invoiceData?: ClientInvoiceData
  withTitle?: boolean
  withAlert?: boolean
}

type Props = OwnProps

interface DescriptionItemProps {
  label: string
  value: React.ReactNode
}

const DescriptionItem = ({ label, value }: DescriptionItemProps) => (
  <div className="grid grid-cols-1 gap-1 border-b border-border py-3 last:border-0 md:grid-cols-3">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="text-sm text-foreground md:col-span-2">{value}</dd>
  </div>
)

const InvoiceDataInfo: FunctionComponent<Props> = ({
  invoiceData,
  withTitle = true,
  withAlert = false,
}) => {
  const { t } = useTranslation('subscription')

  if (!invoiceData && withAlert) {
    return (
      <Alert variant="default" className="border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t<string>('setInvoiceDataAlert')}</AlertTitle>
      </Alert>
    )
  }

  if (!invoiceData) {
    return (
      <Card>
        {withTitle && (
          <CardHeader>
            <CardTitle>{t<string>('invoice.title')}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-center text-muted-foreground">{t<string>('common:noData')}</p>
        </CardContent>
      </Card>
    )
  }

  const countryName = COUNTRIES.find((country) => country.isoCode === invoiceData.country)?.name ?? 'Poland'

  return (
    <Card>
      {withTitle && (
        <CardHeader>
          <CardTitle>{t<string>('invoice.title')}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="divide-y divide-border">
        <DescriptionItem
          label={t('invoice.email')}
          value={invoiceData.email || '-'}
        />
        <DescriptionItem
          label={t('invoice.firstName')}
          value={invoiceData.firstName || '-'}
        />
        <DescriptionItem
          label={t('invoice.lastName')}
          value={invoiceData.lastName || '-'}
        />
        {invoiceData.companyName !== '' && (
          <DescriptionItem
            label={t('invoice.companyName')}
            value={invoiceData.companyName || '-'}
          />
        )}
        {invoiceData.nip !== '' && (
          <DescriptionItem
            label={t('invoice.nip.name')}
            value={invoiceData.nip || '-'}
          />
        )}
        <DescriptionItem
          label={t('invoice.street')}
          value={invoiceData.street || '-'}
        />
        <DescriptionItem
          label={t('invoice.postalCode')}
          value={invoiceData.postalCode || '-'}
        />
        <DescriptionItem
          label={t('invoice.city')}
          value={invoiceData.city || '-'}
        />
        <DescriptionItem
          label={t('invoice.country')}
          value={t<string>(`common:countries.${countryName}`)}
        />
        {invoiceData.additionalInfo && invoiceData.additionalInfo !== '' && (
          <DescriptionItem
            label={t('invoice.additionalInfo')}
            value={invoiceData.additionalInfo}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default InvoiceDataInfo
