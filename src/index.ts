import { log, queue, writeLogs } from "./logger";
import { metrics } from "./metrics";
async function startApiTraffic() {
    setInterval(async () => {
        void log(`request ${Math.floor(Math.random() * 1000)}`);
    }, 200);
}

async function startWorkerTraffic() {
    async function loop() {
        while (true) {
            void log(`job ${Math.floor(Math.random() * 10000)} processed`);
            const pause = 300 + Math.random() * 700; // entre 300ms e 1s
            await new Promise<void>((resolve) => setTimeout(resolve, pause));
        }
    }

    await loop();
}

async function startBurstTraffic() {
    setInterval(async () => {
        const burstSize = 20 + Math.floor(Math.random() * 30);

        for (let i = 0; i < burstSize; i++) {
            const delay = Math.random() * 500;

            setTimeout(async () => {
                void log(`event #${i + 1} in burst`);
            }, delay);
        }
    }, 5000);
}
function startMetricsReporter() {
    setInterval(() => {
        const avgWait =
            metrics.dequeued === 0 ? 0 : metrics.totalWaitMs / metrics.dequeued;

        console.log("===== METRICS =====");
        console.log("Enqueued:", metrics.enqueued);
        console.log("Dequeued:", metrics.dequeued);
        console.log("In queue:", queue.size);
        console.log("Backpressure events:", metrics.backpressureEvents);
        console.log("Avg wait (ms):", avgWait.toFixed(2));
        console.log("===================");
    }, 2000);
}

async function startSpikeTraffic() {
    // espera alguns segundos pra “aquecer” o sistema
    await new Promise<void>((resolve) => setTimeout(resolve, 3000));

    console.log("🔥 Iniciando SPIKE de 10k logs!");

    const total = 10_000;
    for (let i = 0; i < total; i++) {
        // aqui é quase “sincrono”, só empilhando log() no mesmo tick
        log(`SPIKE event #${i + 1}`);
    }

    console.log("🔥 SPIKE disparado!");
}
async function main() {
    console.log("Iniciando produtores de logs...");
    await Promise.all([
        writeLogs(),
        startMetricsReporter(),
        startSpikeTraffic(),
        // startApiTraffic(),
        // startWorkerTraffic(),
        // startBurstTraffic(),
    ]);
    process.exit(1);
}

main().then(() => {});
