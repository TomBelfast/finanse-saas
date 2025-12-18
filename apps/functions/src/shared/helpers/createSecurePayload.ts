import cloneDeep from 'lodash.clonedeep';

export const createSecurePayload = (payload: unknown): unknown => {
  const copy = cloneDeep(payload);
  if (copy !== null && typeof copy === 'object') {
    const propertiesToHide = [
      'apiSecret',
      'apiKey',
      'apiToken',
      'secretKey',
      'clientSecret',
      'access_token',
      'refresh_token',
      'accessToken',
    ];

    propertiesToHide.forEach((key) => {
      if (key in copy && typeof copy === 'object' && copy !== null) {
        (copy as Record<string, unknown>)[key] = '*******';
      }
    });
  }

  return copy;
};
