import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Kafka, KafkaConfig, logLevel } from "kafkajs";

@Injectable()
export class BaseKafkaService {
    protected kafka: Kafka;

    constructor(protected readonly configService: ConfigService) {
        this.kafka = new Kafka(this.createKafkaConfig());
    }

    private createKafkaConfig(): KafkaConfig {
        const brokers = this.configService
            .getOrThrow<string>("KAFKA_BROKERS")
            .split(",");

        return {
            clientId: this.configService.getOrThrow("KAFKA_CLIENT_ID"),
            brokers: brokers,
            logCreator: this.kafkaLogCreator,
        };
    }

    private readonly kafkaLogCreator = () => {
        const nestLogger = new Logger("KafkaJs");

        return ({ level, log }): void => {
            const { message, timestamp, logger, ...extras } = log;

            // Map Kafka log levels to NestJS nestLogger methods
            const logMethod =
                {
                    [logLevel.ERROR]: nestLogger.error,
                    [logLevel.WARN]: nestLogger.warn,
                    [logLevel.INFO]: nestLogger.log,
                    [logLevel.DEBUG]: nestLogger.debug,
                    [logLevel.NOTHING]: nestLogger.log,
                }[level] || nestLogger.log;

            logMethod.call(
                nestLogger,
                `${message} - ${JSON.stringify(extras)}`,
            );
        };
    };

    public getKafkaTopic(baseTopic: string): string {
        const environment = this.configService.get<string>("NODE_ENV");

        if (!environment) {
            throw new Error(
                "NODE_ENV is not defined. Ensure that NODE_ENV is set in your environment or configuration.",
            );
        }
        return `${environment}-${baseTopic}`;
    }

    public getGroupId(baseGroupId: string): string {
        const environment = this.configService.get<string>("NODE_ENV");

        if (!environment) {
            throw new Error(
                "NODE_ENV is not defined. Ensure that NODE_ENV is set in your environment or configuration.",
            );
        }
        return `${environment}-${baseGroupId}`;
    }
}
