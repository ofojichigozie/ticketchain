export function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string') return error;

  if (error !== null && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    const responseData = (err.response as Record<string, unknown> | undefined)
      ?.data as Record<string, unknown> | undefined;
    const backendMessage = responseData?.message;

    if (typeof backendMessage === 'string' && backendMessage)
      return backendMessage;
    if (Array.isArray(backendMessage) && backendMessage.length > 0)
      return backendMessage.join(', ');

    if (typeof err.message === 'string' && err.message) return err.message;
  }

  return fallback;
}
