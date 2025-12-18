export enum FirestoreCollections {
  USERS = 'users',
  NOTIFICATIONS = 'notifications',
  SETTINGS = 'settings',
  BUSINESS_EVENTS = 'business-events',
  REPORTS = 'reports',
  SUBSCRIPTIONS = 'subscriptions', // system subscriptions
  API_TOKENS = 'api-tokens',
  STATS_PER_MONTH = 'stats-per-month',
  
  // New collections for user financial obligations
  USER_SUBSCRIPTIONS = 'user_subscriptions',
  USER_INSURANCES = 'user_insurances',
  USER_LOANS = 'user_loans',
  USER_REMINDERS = 'user_reminders',
  USER_REMINDER_SETTINGS = 'user_reminder_settings',
} 