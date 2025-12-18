/**
 * Test Data Fixtures
 * 
 * Centralized test data for E2E tests
 */

export const testData = {
  user: {
    email: process.env.PLAYWRIGHT_TEST_EMAIL || 'test@example.com',
    password: process.env.PLAYWRIGHT_TEST_PASSWORD || 'TestPassword123!',
  },
  subscription: {
    name: 'Test Subscription',
    amount: '99.99',
    currency: 'PLN',
    provider: 'Test Provider',
    cycle: 'miesięczny',
  },
  insurance: {
    name: 'Test Insurance',
    amount: '150.00',
    currency: 'PLN',
    insuranceCompany: 'Test Insurance Company',
    insuranceType: 'health',
  },
  loan: {
    name: 'Test Loan',
    totalAmount: '10000',
    remainingAmount: '8000',
    interestRate: '5.5',
    currency: 'PLN',
    lender: 'Test Bank',
    loanType: 'mortgage',
    paymentFrequency: 'monthly',
    durationInMonths: 120,
  },
  ai: {
    name: 'Test AI Service',
    amount: '29.99',
    currency: 'PLN',
    aiCompany: 'Test AI Company',
    aiType: 'chatbot',
  },
};

