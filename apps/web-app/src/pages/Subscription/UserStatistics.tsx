import React, { FunctionComponent, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RequestStatus,
  statisticsActions,
  AppStore,
  Size,
  SubscriptionPlanDetails,
} from '@akademiasaas/shared'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '~/initializeStore'
import { Separator } from '~/components/ui/separator'
import { Progress } from '~/components/ui/progress'
import { Skeleton } from '~/components/ui/skeleton'
import { Card, CardContent } from '~/components/ui/card'

interface OwnProps {
  currentPlanDetails: SubscriptionPlanDetails
}

type Props = OwnProps

const UserStatistics: FunctionComponent<Props> = ({ currentPlanDetails }) => {
  const { t } = useTranslation(['subscription'])
  const { creatorStatsStatus, creatorStats, currentMonthStats } = useSelector(
    (store: AppStore) => store.statistics
  )
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(statisticsActions.subscribeToCreatorStats())
  }, [dispatch])

  const statistics = [
    {
      key: 'statistics.products',
      current: creatorStats?.totalNumberOfProducts ?? 0,
      limit: currentPlanDetails.products,
      percentageUsage: Math.round(
        ((creatorStats?.totalNumberOfProducts ?? 0) / currentPlanDetails.products) * 100
      ),
    },
    {
      key: 'statistics.paid',
      current: creatorStats?.totalNumberOfPaidSubscribers ?? 0,
      limit: currentPlanDetails.clients,
      percentageUsage: Math.round(
        ((creatorStats?.totalNumberOfPaidSubscribers ?? 0) / currentPlanDetails.clients) * 100
      ),
    },
    {
      key: 'statistics.monthlyTransactions',
      current: currentMonthStats?.numberOfTransactions ?? 0,
      limit: currentPlanDetails.monthlyTransactions,
      percentageUsage: Math.round(
        ((currentMonthStats?.numberOfTransactions ?? 0) / currentPlanDetails.monthlyTransactions) *
        100
      ),
    },
    {
      key: 'statistics.uploadLimit',
      current: Size.fromBytes(creatorStats?.totalUploadedBytes ?? 0).gigabytes,
      limit: currentPlanDetails.uploadLimit.gigabytes,
      percentageUsage: Math.round(
        ((creatorStats?.totalUploadedBytes ?? 0) / currentPlanDetails.uploadLimit.bytes) * 100
      ),
    },
  ]

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-destructive'
    if (percentage >= 80) return 'bg-orange-500'
    return 'bg-primary'
  }

  const isLoading = creatorStatsStatus === RequestStatus.SUBSCRIBING

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center">
        <Separator className="flex-1" />
        <span className="px-4 text-sm font-medium text-muted-foreground">
          {t<string>('statistics.title')}
        </span>
        <Separator className="flex-1" />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {statistics.map((stat) => (
              <div key={stat.key} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-[200px] text-sm font-medium">
                  {t<string>(stat.key)}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <div className="text-right text-sm text-muted-foreground">
                    {stat.current} / {stat.limit}
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full transition-all ${getProgressColor(stat.percentageUsage)}`}
                      style={{ width: `${Math.min(stat.percentageUsage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default UserStatistics
