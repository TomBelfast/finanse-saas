import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useAppDispatch } from '~/initializeStore';
import {
  AppStore,
  enumValues,
  subscriptionActions,
  SubscriptionPlan,
  UserSubscriptionInterval,
  getPlanDetails,
  planDetailsFromDocument,
} from '@akademiasaas/shared';
import classNames from 'classnames';
import { Clock, Wallet, AlertCircle, Loader2 } from 'lucide-react';
import UserInvoiceData from '~/pages/Subscription/InvoiceData';
import UserStatistics from './UserStatistics';
import ConfirmModal from '~/components/ConfirmModal/ConfirmModal';
import Stripe from 'stripe';
import { FeaturesList } from './FeaturesList';
import { PRICING_PAGE_URL } from '@akademiasaas/shared';

interface OwnProps { }

type Props = OwnProps;

const DATE_FORMAT = 'DD.MM.YYYY (HH:mm)';

const SUBSCRIPTION_ERROR = {
  NO_PAYMENT_SOURCE:
    'This customer has no attached payment source or default payment method.',
};

export const statusMapper = {
  active: 'default',
  paid: 'default',
  imported: 'default',
  past_due: 'destructive',
  incomplete_expired: 'destructive',
  trialing: 'secondary',
  incomplete: 'secondary',
  canceled: 'destructive',
  unpaid: 'destructive',
  expired: 'destructive',
} as const;

const Subscription: FunctionComponent<Props> = () => {
  const { t } = useTranslation(['subscription']);
  const userDetails = useSelector((store: AppStore) => store.user.details);
  const subscription = useSelector(
    (store: AppStore) => store.subscription.data
  );
  const dispatch = useAppDispatch();
  const userPlanDetails = planDetailsFromDocument(
    userDetails?.subscription?.plan
  );
  const [selectedPlan, setPlan] = useState<SubscriptionPlan>(
    userPlanDetails?.name || SubscriptionPlan.Basic
  );
  const [selectedInterval, setInterval] = useState<UserSubscriptionInterval>(
    'month'
  );
  const [fetchingClientSession, toggleFetchingSessions] = useState(false);
  const subscriptionInterval = subscription?.items.data[0].plan.interval;
  const [activatingTrial, setActivatingTrial] = useState(false);
  const subscriptionPrice =
    (subscription?.items.data[0].price.unit_amount ?? 0) / 100;
  const [changingPlan, toggleChangingPlan] = useState(false);
  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [invoice, setInvoice] = useState<Stripe.Response<Stripe.Invoice> | null>(
    null
  );

  const selectedPlanDetails = getPlanDetails(selectedPlan);

  const plans = enumValues(SubscriptionPlan);

  const subscriptionOptions = useMemo(() => {
    return [
      {
        label: t<string>(`plan.${SubscriptionPlan.Free}`),
        value: SubscriptionPlan.Free,
      },
      {
        label: t<string>(`plan.${SubscriptionPlan.Basic}`),
        value: SubscriptionPlan.Basic,
      },
      {
        label: t<string>(`plan.${SubscriptionPlan.Standard}`),
        value: SubscriptionPlan.Standard,
      },
      {
        label: t<string>(`plan.${SubscriptionPlan.Professional}`),
        value: SubscriptionPlan.Professional,
      },
    ];
  }, [t]);

  const status = userDetails?.subscription?.requiresAction?.status;

  const disabledFreePlan =
    selectedPlan === SubscriptionPlan.Free && userPlanDetails?.name !== 'free';

  useEffect(() => {
    if (subscription && status !== 'reached_limit') {
      setInterval(
        (subscription.items.data[0].plan.interval as 'month' | 'year') || 'month'
      );
      setPlan(
        (subscription.items.data[0].price.metadata.levels as SubscriptionPlan) ||
        SubscriptionPlan.Basic
      );
    }
  }, [subscription, status]);

  useEffect(() => {
    if (status === 'reached_limit') {
      setInterval(
        (subscription?.items.data[0].plan.interval as 'month' | 'year') || 'month'
      );
      setPlan(
        userDetails?.subscription?.requiresAction?.shouldUpgradeTo ||
        SubscriptionPlan.Standard
      );
    }
  }, [status, subscription?.items.data, userDetails?.subscription]);

  useEffect(() => {
    return () => {
      dispatch(subscriptionActions.unsubscribeFromSubscription());
    };
  }, [dispatch]);

  const subscriptionId = userDetails?.subscription?.id;

  useEffect(() => {
    if (subscriptionId) {
      dispatch(subscriptionActions.subscribeToSubscription(subscriptionId));
    }
  }, [dispatch, subscriptionId]);

  const createBillingSession = async () => {
    try {
      toggleFetchingSessions(true);

      const result = await dispatch(
        subscriptionActions.createBillingCustomerSession()
      ).unwrap();

      window.location.replace(result.url);
    } catch (e) {
      toggleFetchingSessions(false);
      toast.error(t('errors.createBillingSession'));
    }
  };

  const checkSubscriptionInvoice = async () => {
    toggleConfirmModal(true);
    const result = await dispatch(
      subscriptionActions.checkSubscriptionInvoice({
        interval: selectedInterval,
        plan: selectedPlan,
      })
    ).unwrap();
    setInvoice(result);
  };

  const changePlan = async () => {
    toggleChangingPlan(true);
    toast.loading(t('changingPlan'), { id: 'load' });
    try {
      await dispatch(
        subscriptionActions.changeSubscriptionPlan({
          interval: selectedInterval,
          plan: selectedPlan,
        })
      ).unwrap();
      toast.dismiss('load');
      toast.success(t('changedPlan'));
      toggleChangingPlan(false);
    } catch (e) {
      toast.dismiss('load');
      if (
        e instanceof Error &&
        e.message === SUBSCRIPTION_ERROR.NO_PAYMENT_SOURCE
      ) {
        toast.error(t('noPaymentMethod'), { duration: 5000 });
      } else {
        toast.error(t('errorWhenChangingPlan'));
      }
      toggleChangingPlan(false);
    }
  };

  const activateSubscription = async () => {
    setActivatingTrial(true);
    await dispatch(subscriptionActions.activateTrial());
    setActivatingTrial(false);
  };

  const subscriptionRegion =
    !userDetails?.country || userDetails.country === 'PL' ? 'pl' : 'intl';

  const showInfoAboutLackOfPaymentMethod =
    userDetails?.subscription && !userDetails.subscription.defaultPaymentMethod;

  if (!userDetails?.subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t<string>('title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-12">
          <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="font-semibold text-lg mb-4">
            {t<string>('freePlanWillBeAdded')}
          </p>
          <Button
            variant="default"
            onClick={activateSubscription}
            disabled={activatingTrial}
          >
            {activatingTrial && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t<string>('activateFreePlan')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t<string>('title')}</h2>
      </div>
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                {t<string>('subscription.currentPlan')}
              </label>
              <div className="font-semibold text-lg">
                {userPlanDetails?.name && plans.includes(userPlanDetails?.name)
                  ? t<string>(`plan.${userPlanDetails.name}`)
                  : t<string>('plan.custom')}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                {t<string>('subscription.status')}
              </label>
              <div className="flex items-center gap-2">
                {userDetails?.subscription ? (
                  <>
                    <Badge
                      variant={
                        (statusMapper[
                          userDetails.subscription.status as keyof typeof statusMapper
                        ] as 'default' | 'destructive' | 'secondary' | 'outline') ||
                        'default'
                      }
                    >
                      {t<string>(
                        `subscriptionStatus.${userDetails.subscription.status}`
                      )}
                    </Badge>
                    {userDetails.subscription.cancelAtPeriodEnd && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t<string>('newsletters:subscription.endAt')}{' '}
                        {dayjs
                          .unix(userDetails.subscription.currentPeriodEnd)
                          .format('DD.MM')}
                      </Badge>
                    )}
                  </>
                ) : (
                  '-'
                )}
              </div>
            </div>

            {userPlanDetails?.name !== SubscriptionPlan.Free && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t<string>('subscription.period')}
                </label>
                <div className="font-semibold">
                  {userDetails?.subscription ? (
                    <span>
                      {dayjs
                        .unix(userDetails?.subscription.currentPeriodStart)
                        .format(DATE_FORMAT)}
                      {userDetails?.subscription.currentPeriodEnd
                        ? ` - ${dayjs
                          .unix(userDetails?.subscription.currentPeriodEnd)
                          .format(DATE_FORMAT)}`
                        : ''}
                    </span>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
            )}

            {userDetails.invoiceData && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t<string>('subscription.settings')}
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="link"
                    onClick={createBillingSession}
                    disabled={fetchingClientSession}
                    className="p-0 h-auto font-semibold"
                  >
                    {fetchingClientSession && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t<string>('subscription.manageSubscription')}
                  </Button>

                  {userDetails?.subscription &&
                    !userDetails.subscription.defaultPaymentMethod && (
                      <Alert variant="warning" className="py-2">
                        <AlertTitle className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {t<string>('addPaymentMethodWarning')}
                        </AlertTitle>
                      </Alert>
                    )}
                </div>
              </div>
            )}
          </div>

          {userPlanDetails && (
            <UserStatistics currentPlanDetails={userPlanDetails} />
          )}

          <UserInvoiceData
            user={userDetails}
            showAsAlert={userDetails?.subscription?.status !== 'active'}
          />

          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-2">
            <div className="sm:flex sm:flex-col sm:items-center">
              <div className="relative self-center mt-4 bg-gray-100 p-0.5 flex sm:mt-4 rounded-lg">
                <button
                  type="button"
                  onClick={() => setInterval('month')}
                  className={classNames(
                    'relative w-1/2 border-gray-200 shadow-sm py-2 text-sm font-medium text-gray-900 whitespace-nowrap focus:outline-none focus:z-10 sm:w-auto sm:px-8 rounded-md transition-all',
                    { 'bg-white shadow-sm': selectedInterval === 'month' },
                    { 'text-gray-500 hover:text-gray-900': selectedInterval !== 'month' }
                  )}
                >
                  {t<string>(`plan.month`)}
                </button>
                <button
                  type="button"
                  onClick={() => setInterval('year')}
                  className={classNames(
                    'relative w-1/2 border-gray-200 shadow-sm py-2 text-sm font-medium text-gray-900 whitespace-nowrap focus:outline-none focus:z-10 sm:w-auto sm:px-8 rounded-md transition-all',
                    { 'bg-white shadow-sm': selectedInterval === 'year' },
                    { 'text-gray-500 hover:text-gray-900': selectedInterval !== 'year' }
                  )}
                >
                  {t<string>(`plan.year`)}
                </button>
              </div>
            </div>
            <div className="mt-10 flex justify-center">
              <div className="relative z-9 shadow-xl w-full max-w-xl rounded-2xl overflow-hidden border border-gray-200">
                <div className="bg-white px-6 pt-12 pb-6">
                  <div>
                    <h3
                      className="text-center text-3xl font-semibold text-gray-900 sm:-mx-6"
                      id="tier-growth"
                    >
                      {plans.includes(selectedPlan)
                        ? t<string>(`plan.${selectedPlan}`)
                        : t<string>('plan.custom')}
                    </h3>
                    <div className="mt-6 flex items-center justify-center">
                      <span className="px-3 flex items-start text-5xl tracking-tight text-gray-900 sm:text-5xl">
                        <span className="font-bold">
                          {plans.includes(selectedPlan)
                            ? t<string>(
                              `plan.price.${subscriptionRegion}.${selectedInterval}.${selectedPlan}`
                            )
                            : subscriptionRegion === 'intl'
                              ? '$' + subscriptionPrice
                              : subscriptionPrice + ' PLN'}
                        </span>
                      </span>
                      <span className="text-2xl font-medium text-gray-500">
                        /{t<string>(`plan.monthly`)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-y-2 my-2">
                      {selectedPlan !== SubscriptionPlan.Free && (
                        <div className="flex items-center justify-center">
                          <p className="text-sm text-gray-500">
                            {t<string>(`plan.${selectedInterval}Desc`)}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-center">
                        <FeaturesList selectedTier={selectedPlan} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center mt-6">
                    <Select
                      value={
                        plans.includes(selectedPlan)
                          ? selectedPlan
                          : t<string>('plan.custom')
                      }
                      onValueChange={(value) =>
                        setPlan(value as SubscriptionPlan)
                      }
                    >
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder={t<string>('plan.custom')} />
                      </SelectTrigger>
                      <SelectContent>
                        {subscriptionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-center mt-5">
                    <p className="text-center text-base mb-0">
                      <a
                        href={`${PRICING_PAGE_URL}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        {t<string>('plan.seeFullPricing')}
                      </a>
                    </p>
                  </div>
                </div>
                {disabledFreePlan ? (
                  <div className="border-t border-gray-200 pt-8 pb-8 px-6 bg-gray-50 sm:px-10 sm:py-10">
                    <div className="mt-4">
                      <div className="flex flex-col gap-4">
                        <Alert variant="warning">
                          <AlertTitle className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {t<string>('cancelSubscriptionToDowngrade')}
                          </AlertTitle>
                        </Alert>
                        <Button
                          className="w-full"
                          onClick={createBillingSession}
                          disabled={fetchingClientSession}
                          variant="default"
                          size="lg"
                        >
                          {fetchingClientSession && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {t<string>('subscription.manageSubscription')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-8 pb-8 px-6 bg-gray-50 sm:px-10 sm:py-10">
                    <div className="mt-2">
                      {selectedPlan === userPlanDetails?.name &&
                        (!subscriptionInterval ||
                          selectedInterval === subscriptionInterval) ? (
                        <Button
                          disabled={true}
                          className="w-full"
                          variant="default"
                          size="lg"
                        >
                          {t<string>('currentPlan')}
                        </Button>
                      ) : (
                        <div className="shadow-md rounded-md">
                          {showInfoAboutLackOfPaymentMethod ? (
                            <Alert variant="warning">
                              <AlertTitle className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {userDetails.invoiceData
                                  ? t<string>('addDefaultPaymentMethod')
                                  : t<string>('addInvoiceData')}
                              </AlertTitle>
                            </Alert>
                          ) : (
                            <>
                              <Button
                                onClick={checkSubscriptionInvoice}
                                disabled={changingPlan}
                                className="w-full"
                                variant="default"
                                size="lg"
                              >
                                {changingPlan && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {userDetails.subscription === null
                                  ? t<string>('activatePlan')
                                  : t<string>('changePlan')}
                              </Button>
                              <ConfirmModal
                                onSave={changePlan}
                                saving={changingPlan}
                                open={showConfirmModal}
                                onClose={() => {
                                  toggleConfirmModal(false);
                                  setInvoice(null);
                                }}
                                modalTitle={t<string>('planChangeConfirmation')}
                                buttonTitle={
                                  Number(selectedPlanDetails.clients) >
                                    Number(
                                      userDetails?.subscription?.plan?.clients
                                    )
                                    ? t<string>('paymentPlanButton')
                                    : t<string>('changePlanButton')
                                }
                              >
                                <div className="p-4">
                                  <h3
                                    className="text-center text-3xl font-semibold text-gray-900 sm:-mx-6"
                                    id="tier-growth"
                                  >
                                    {plans.includes(selectedPlan)
                                      ? t<string>(`plan.${selectedPlan}`)
                                      : t<string>('plan.custom')}
                                  </h3>
                                  <div className="mt-6 flex items-center justify-center">
                                    <span className="px-3 flex items-start text-5xl tracking-tight text-gray-900 sm:text-5xl">
                                      <span className="font-bold">
                                        {plans.includes(selectedPlan)
                                          ? t<string>(
                                            `plan.price.${subscriptionRegion}.${selectedInterval}.${selectedPlan}`
                                          )
                                          : subscriptionRegion === 'intl'
                                            ? '$' + subscriptionPrice
                                            : subscriptionPrice + ' PLN'}
                                      </span>
                                    </span>
                                    <span className="text-2xl font-medium text-gray-500">
                                      /{t<string>(`plan.monthly`)}
                                    </span>
                                  </div>
                                  <div className="flex flex-col gap-y-2 my-2">
                                    {selectedPlan !== SubscriptionPlan.Free && (
                                      <div className="flex items-center justify-center">
                                        <p className="text-sm text-gray-500">
                                          {t<string>(
                                            `plan.${selectedInterval}Desc`
                                          )}
                                        </p>
                                      </div>
                                    )}
                                    <div className="flex items-center justify-center">
                                      <FeaturesList selectedTier={selectedPlan} />
                                    </div>
                                    {userDetails?.subscription?.priceId ? (
                                      invoice &&
                                      invoice.total > 0 && (
                                        <div>
                                          <h4 className="text-center text-2xl font-semibold text-gray-900 sm:-mx-6">
                                            {t<string>('paymentTotal') +
                                              (invoice.currency === 'pln'
                                                ? (invoice.total / 100)
                                                  .toFixed(2)
                                                  .replace('.', ',') +
                                                ' ' +
                                                invoice.currency.toUpperCase()
                                                : (invoice.total / 100).toFixed(
                                                  2
                                                ) +
                                                ' ' +
                                                invoice.currency.toUpperCase())}
                                            <span
                                              style={{
                                                fontSize: 14,
                                                marginLeft: 6,
                                              }}
                                            >
                                              brutto
                                            </span>
                                          </h4>
                                          {userDetails?.subscription
                                            ?.currentPeriodEnd && (
                                              <h5 className="text-center text-md font-semibold text-gray-900 sm:-mx-6">
                                                {t<string>('paymentPeriod') +
                                                  dayjs
                                                    .unix(invoice.created)
                                                    .format(DATE_FORMAT) +
                                                  ' - ' +
                                                  dayjs
                                                    .unix(
                                                      userDetails?.subscription
                                                        .currentPeriodEnd
                                                    )
                                                    .format(DATE_FORMAT)}
                                              </h5>
                                            )}
                                        </div>
                                      )
                                    ) : (
                                      <div>
                                        <h4 className="text-center text-2xl font-semibold text-gray-900 sm:-mx-6">
                                          {t<string>('paymentTotal') +
                                            1.23 *
                                            Number(
                                              t(
                                                `plan.price.${subscriptionRegion}.${selectedInterval}.${selectedPlan}`
                                              ).split(' ')[0]
                                            ) +
                                            ' ' +
                                            t(
                                              `plan.price.${subscriptionRegion}.${selectedInterval}.${selectedPlan}`
                                            ).split(' ')[1]}
                                          <span
                                            style={{
                                              fontSize: 14,
                                              marginLeft: 6,
                                            }}
                                          >
                                            brutto
                                          </span>
                                        </h4>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </ConfirmModal>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Subscription;
