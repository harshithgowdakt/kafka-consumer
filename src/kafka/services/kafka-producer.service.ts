import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Message, Producer } from "kafkajs";

import { BaseKafkaService } from "./base-kafka.service";
import { Utils } from "../../shared/utils/utils";

@Injectable()
export class KafkaProducerService
    extends BaseKafkaService
    implements OnModuleInit
{
    private readonly logger = new Logger(KafkaProducerService.name);
    private readonly producer: Producer;

    constructor(configService: ConfigService) {
        super(configService);
        this.producer = this.kafka.producer({ idempotent: true });
    }

    async onModuleInit(): Promise<void> {
        await this.producer.connect();
        this.logger.log("Producer connected successfully");
    }

    async publishEvent(topic: string, message: string): Promise<void> {
        const publishOperation = async (): Promise<void> => {
            const messages: Message[] = [{ key: null, value: message }];
            await this.producer.send({ topic, messages });
            this.logger.log(`Event published to topic ${topic}`);
        };
        await Utils.retryOperation(publishOperation);
    }
}
