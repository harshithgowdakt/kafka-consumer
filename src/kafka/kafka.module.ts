import { Module } from "@nestjs/common";

import { BaseKafkaService } from "./services/base-kafka.service";
import { KafkaProducerService } from "./services/kafka-producer.service";

@Module({
    providers: [KafkaProducerService, BaseKafkaService],
    exports: [KafkaProducerService, BaseKafkaService],
})
export class KafkaModule {}
