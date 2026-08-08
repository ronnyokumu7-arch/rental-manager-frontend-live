/**
 * Centralized confirmation dialog.
 *
 * Native confirmAction() is used intentionally HERE ONLY as a single choke point.
 * Every destructive confirmation in the app routes through this function,
 * so we can later swap to a branded modal by editing this one file.
 */
export function confirmAction(message: string): boolean {
  // eslint-disable-next-line no-alert
  return window.confirmAction(message);
}
