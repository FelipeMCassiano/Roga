import { createWriteStream } from "fs";
import { recordBackpressure, recordDequeue, recordEnqueue } from "./metrics";
import { QueueLog } from "./types";

export const queue = new QueueLog();

export function log(msg: string): void {
    const createdAt = Date.now();

    recordEnqueue();
    queue.enqueue(() => {
        const wait = Date.now() - createdAt;
        process.nextTick(() => recordDequeue(wait));
        return msg;
    });
}

export async function writeLogs() {
    const logger = createWriteStream("logs.txt", { flags: "a" });
    let canWrite = true;
    let resolvePause: (value?: unknown) => void;
    const pauseWrite = () =>
        new Promise((resolve) => {
            resolvePause = resolve;
        });
    while (true) {
        for (let i = 0; i < 5; i++) {
            const logToWrite = await queue.dequeue();

            const date = new Date();

            const formatted =
                new Intl.DateTimeFormat("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZone: "UTC",
                }).format(date) + " UTC";

            if (!canWrite) {
                process.nextTick(() => recordBackpressure());
                logger.once("drain", () => {
                    canWrite = true;
                    resolvePause?.();
                });
                await pauseWrite();
            }
            canWrite = logger.write(`[${formatted}]: ${logToWrite()}\n`);
        }
    }
}
