
export interface NativeBridgeHost {
  invoke(command: string, payload?: unknown): Promise<unknown>;
}

declare global {
  interface Window {
    nativeBridge?: NativeBridgeHost;
  }
}

export function isNativeAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.nativeBridge?.invoke === 'function';
}

export async function callNative<T>(
  command: string,
  payload: unknown,
  mock: () => Promise<T> | T,
): Promise<T> {
  if (isNativeAvailable()) {
    return (await window.nativeBridge!.invoke(command, payload)) as T;
  }
  return mock();
}
