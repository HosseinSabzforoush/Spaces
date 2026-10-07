import { handlers, hasBackend } from './webviewBridge';

export function isNativeAvailable(): boolean {
  return hasBackend();
}

export async function callNative<T>(
  command: string,
  payload: unknown,
  mock: () => Promise<T> | T,
): Promise<T> {
  const handler = handlers[command];
  if (isNativeAvailable() && handler) {
    return (await (handler as (p: unknown) => Promise<unknown>)(payload)) as T;
  }
  return mock();
}