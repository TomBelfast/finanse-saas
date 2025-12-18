export const cloudFunctionErrorHandler = (e: unknown | Error) => {
  if (typeof e === 'object' && e !== null && 'code' in e && typeof (e as any).code === 'string') {
    const code = (e as any).code;
    if (code === 'permission-denied') {
      return {
        code: 403,
        error: e,
      };
    }

    return {
      code: code === 'not-found' ? 404 : 500,
      error: e,
    };
  }

  return {
    code: 500,
    error: e,
  };
};
