import { Kafka, Producer, Message } from "kafkajs";

interface AppLog {
    timestamp: string;
    level: string;
    message: string;
    appName: string;
    hostname: string;
    env: string;
}

// Kafka setup
const kafka = new Kafka({
    brokers: ["localhost:29092"],
});

const producer: Producer = kafka.producer();

async function publishCsvToKafka(topic: string): Promise<void> {
    await producer.connect();
    console.log("Kafka Producer connected");

    const batchSize = 1;
    let batch: Message[] = [];
    let count = 0;
    const startTime = new Date();

    try {
        for (let index = 0; index < 1000; index++) {
            const eventTime = new Date(
                startTime.getTime() + index * 1000,
            ).toISOString();

            const formattedRow: AppLog = {
                timestamp: eventTime,
                level: "INFO",
                message: `Event ${index} occurred.`,
                appName: "local-app",
                hostname: "localhost",
                env: "local",
            };

            batch.push({ value: JSON.stringify(formattedRow) });

            if (batch.length === batchSize) {
                await producer.send({ topic, messages: batch });
                count += batch.length;
                console.log(
                    `Published batch of ${batch.length} events. Total published: ${count}`,
                );
                batch = [];
            }
        }

        if (batch.length > 0) {
            await producer.send({ topic, messages: batch });
            count += batch.length;
            console.log(
                `Published final batch of ${batch.length} events. Total published: ${count}`,
            );
        }
    } catch (error) {
        console.error("Error publishing batch to Kafka:", error);
    } finally {
        await producer.disconnect();
        console.log("Kafka Producer disconnected");
    }
}

const topic = "local-app-logs";

publishCsvToKafka(topic).then(() => {
    console.log("Publishing completed successfully.");
});
