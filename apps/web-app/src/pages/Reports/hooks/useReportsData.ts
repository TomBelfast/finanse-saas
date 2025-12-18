import { useState, useEffect } from 'react';
import { apiClient } from '~/services/apiClient';
import { logger } from '~/utils/logger';
import { ApiLoan, ApiSubscription, ApiInsurance, ApiAI } from '~/types/api';
import { ReportsData } from '../types/reportsTypes';

export function useReportsData(): ReportsData {
  const [loans, setLoans] = useState<ApiLoan[]>([]);
  const [subscriptions, setSubscriptions] = useState<ApiSubscription[]>([]);
  const [insurances, setInsurances] = useState<ApiInsurance[]>([]);
  const [ai, setAI] = useState<ApiAI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [loansData, subscriptionsData, insurancesData, aiData] = await Promise.all([
          apiClient.getLoans(),
          apiClient.getSubscriptions(),
          apiClient.getInsurances(),
          apiClient.getAI(),
        ]);
        setLoans(loansData as ApiLoan[]);
        setSubscriptions(subscriptionsData as ApiSubscription[]);
        setInsurances(insurancesData as ApiInsurance[]);
        setAI(aiData as ApiAI[]);
      } catch (error) {
        logger.error('Error loading data', error instanceof Error ? error : new Error(String(error)));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return { loans, subscriptions, insurances, ai, loading };
}

