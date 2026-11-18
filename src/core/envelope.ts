export const ENVELOPE_VERSION = 1 as const;

export interface StorageEnvelope<T = unknown> {
  __ls: typeof ENVELOPE_VERSION;
  value: T;
  expiresAt?: number;
}

export function isEnvelope(parsed: unknown): parsed is StorageEnvelope {
  return (
    typeof parsed === 'object' &&
    parsed !== null &&
    (parsed as StorageEnvelope).__ls === ENVELOPE_VERSION &&
    'value' in parsed
  );
}

export function createEnvelope<T>(value: T, expiresAt?: number): StorageEnvelope<T> {
  const envelope: StorageEnvelope<T> = {
    __ls: ENVELOPE_VERSION,
    value,
  };

  if (expiresAt !== undefined) {
    envelope.expiresAt = expiresAt;
  }

  return envelope;
}

export function isExpired(expiresAt: number | undefined, now = Date.now()): boolean {
  return expiresAt !== undefined && now >= expiresAt;
}
