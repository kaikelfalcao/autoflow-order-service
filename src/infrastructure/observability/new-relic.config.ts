type EventAttributes = Record<string, unknown>;

type NewRelicLike = {
  recordCustomEvent?: (eventType: string, attributes: EventAttributes) => void;
} | null;

const newRelicInstance: NewRelicLike = (() => {
  const enabled = process.env.ENABLE_NEW_RELIC === 'true';
  if (!enabled) {
    return null;
  }

  try {
    // Carrega de forma opcional: sem bloqueio em desenvolvimento/local.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('newrelic') as NewRelicLike;
  } catch {
    return null;
  }
})();

export function recordBusinessEvent(eventType: string, attributes: EventAttributes): void {
  if (!newRelicInstance?.recordCustomEvent) {
    return;
  }

  newRelicInstance.recordCustomEvent(eventType, attributes);
}

export function recordSagaCompensation(params: {
  orderId: string;
  reason: string;
  step: string;
}): void {
  recordBusinessEvent('SagaCompensation', {
    orderId: params.orderId,
    reason: params.reason,
    step: params.step,
  });
}

