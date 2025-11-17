export const metrics = {
    enqueued: 0,
    dequeued: 0,
    backpressureEvents: 0,
    totalWaitMs: 0,
};

export function recordEnqueue() {
    metrics.enqueued++;
}

export function recordDequeue(wait: number) {
    metrics.dequeued++;
    metrics.totalWaitMs += wait;
}

export function recordBackpressure() {
    metrics.backpressureEvents++;
}
