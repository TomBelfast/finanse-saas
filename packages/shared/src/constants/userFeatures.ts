export const USER_FEATURES = {
  API: 'api',
  REMINDERS: 'reminders',
} as const;

export type UserFeatures = (typeof USER_FEATURES)[keyof typeof USER_FEATURES];
