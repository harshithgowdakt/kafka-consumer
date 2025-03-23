import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Batch, Consumer, EachBatchPayload } from "kafkajs";
import * as CircuitBreaker from "opossum";

import { BaseKafkaService } from "../../kafka/services/base-kafka.service";
import {
    AppEventLogsConsumerConfig,
    CircuitBreakerConfig,
    ConsumerResumeInterval,
    KafkaBaseTopic,
} from "../../shared/constants/constants";
import { AppLogRepository } from "../repositories/app-log.repository";
import { AppLogUtils } from "../utils/app-log.utils";

@Injectable()
export class AppLogService extends BaseKafkaService implements OnModuleInit {
    private readonly logger = new Logger(AppLogService.name);
    private readonly consumer: Consumer;
    private breaker: CircuitBreaker;

    constructor(
        private readonly appLogRepository: AppLogRepository,
        configService: ConfigService,
    ) {
        super(configService);
        AppEventLogsConsumerConfig.groupId = this.getGroupId(
            AppEventLogsConsumerConfig.groupId,
        );
        this.consumer = this.kafka.consumer(AppEventLogsConsumerConfig);
    }

    async onModuleInit(): Promise<void> {
        await this.initializeConsumer();
        await this.initializeCircuitBreaker();
        this.setResumeInterval();
    }

    private async initializeConsumer(): Promise<void> {
        await this.consumer.connect();
        await this.consumer.subscribe({
            topic: this.getKafkaTopic(KafkaBaseTopic.APP_LOGS),
            fromBeginning: true,
        });
        await this.consumer.run({
            eachBatch: async (payload: EachBatchPayload) =>
                await this.processBatch(payload),
            autoCommit: false,
        });
        this.logger.log(
            `Consumer connected and subscribed to ${this.getKafkaTopic(KafkaBaseTopic.APP_LOGS)}`,
        );
    }

    private async initializeCircuitBreaker(): Promise<void> {
        this.breaker = new CircuitBreaker(
            this.commitBatch.bind(this),
            CircuitBreakerConfig,
        );

        this.breaker.on("open", () => {
            this.logger.warn(
                "Circuit breaker opened! Too many failures. Stopping further requests for now.",
            );
            this.consumer.pause([
                { topic: this.getKafkaTopic(KafkaBaseTopic.APP_LOGS) },
            ]);
        });

        this.breaker.on("close", () => {
            this.logger.log("Circuit breaker closed. Service is stable again.");
            this.consumer.resume([
                { topic: this.getKafkaTopic(KafkaBaseTopic.APP_LOGS) },
            ]);
        });

        this.logger.debug(
            `Circuit breaker for ${this.getKafkaTopic(KafkaBaseTopic.APP_LOGS)} is initialized successfully`,
        );
    }

    private setResumeInterval(): void {
        setInterval(async () => {
            const pausedPartitions = this.consumer.paused();
            if (pausedPartitions.length > 0) {
                this.logger.log(
                    "app-event-logs consumer is paused, resuming...",
                );
                this.consumer.resume(pausedPartitions);
            }
        }, ConsumerResumeInterval);
    }

    private async processBatch({
        batch,
        heartbeat,
    }: EachBatchPayload): Promise<void> {
        try {
            this.logger.log(
                `Processing batch from partition ${batch.firstOffset()} till ${batch.lastOffset()}, batch size=${batch.messages.length}`,
            );
            const appLogs = await this.processMessages(batch, heartbeat);
            await this.breaker.fire(batch, appLogs);
        } catch (error) {
            this.logger.error("Error processing batch:", error);
            this.logger.error(`Resetting the offset to ${batch.firstOffset()}`);
            this.consumer.seek({
                topic: batch.topic,
                partition: batch.partition,
                offset:
                    batch?.firstOffset() ||
                    (
                        Number(batch.lastOffset()) - batch.messages.length
                    ).toString(),
            });
        }
    }

    private async processMessages(
        batch: Batch,
        heartbeat: () => Promise<void>,
    ): Promise<unknown> {
        const appLogsClickhouse: any[] = [];
        for (const message of batch.messages) {
            try {
                const event = JSON.parse(message?.value?.toString() || "");
                const env = event.t;

                const currentTime = new Date();
                const eventTime = event?.time
                    ? new Date(event.time)
                    : currentTime;

                const sevenDaysAgo = new Date(
                    currentTime.getTime() - 7 * 24 * 60 * 60 * 1000,
                );
                const currentTimePlus2Hours = new Date(
                    currentTime.getTime() + 2 * 60 * 60 * 1000,
                );

                if (
                    eventTime < sevenDaysAgo ||
                    eventTime > currentTimePlus2Hours
                ) {
                    this.logger.warn(
                        `Skipping log with timestamp ${eventTime} as it is outside the valid range.`,
                    );
                    continue;
                }

                if (env && env === this.configService.get<string>("NODE_ENV")) {
                    const log = AppLogUtils.getLogClickhouse(event);
                    appLogsClickhouse.push(log);
                }

                await heartbeat();
            } catch (error) {
                this.logger.error(
                    `Error while processing the event at offset ${message.offset}:`,
                    error,
                );
            }
        }
        return appLogsClickhouse;
    }

    private async commitBatch(batch: Batch, logs: any[]): Promise<void> {
        await this.appLogRepository.batchInsertToClickhouse(logs);
        await this.consumer.commitOffsets([
            {
                topic: batch.topic,
                partition: batch.partition,
                offset: (parseInt(batch.lastOffset(), 10) + 1).toString(),
            },
        ]);

        this.logger.log(
            `Batch from partition ${batch.partition} committed successfully up to offset ${batch.lastOffset()}.`,
        );
    }
}
