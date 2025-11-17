type Log<T> = () => string;
export class QueueLog<T extends Log<string>> {
    private items: { [key: number]: T } = {};
    private waiters: ((item: T) => void)[] = [];
    private head = 0;
    private tail = 0;

    enqueue(log: T): void {
        if (this.waiters.length > 0) {
            const resolve = this.waiters.shift()!;
            resolve(log);
            return;
        }

        this.items[this.tail] = log;
        this.tail++;
    }

    dequeue(): Promise<T> {
        return new Promise<T>((resolve) => {
            if (this.isEmpty) {
                this.waiters.push(resolve);
                return;
            }

            resolve(this.remove());
        });
    }
    private remove(): T {
        const item = this.items[this.head];
        delete this.items[this.head];
        this.head++;
        return item!;
    }

    peek(): T | undefined {
        if (this.isEmpty) {
            return;
        }
        return this.items[this.head];
    }

    get size(): number {
        return this.tail - this.head;
    }

    get isEmpty(): boolean {
        return this.head === this.tail;
    }
}
