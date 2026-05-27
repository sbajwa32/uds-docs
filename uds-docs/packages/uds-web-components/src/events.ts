export function emitUdsEvent<T>(
  target: EventTarget,
  type: string,
  detail: T,
  options: { cancelable?: boolean } = {},
): CustomEvent<T> {
  const event = new CustomEvent<T>(type, {
    bubbles: true,
    composed: true,
    cancelable: options.cancelable ?? false,
    detail,
  });
  target.dispatchEvent(event);
  return event;
}
