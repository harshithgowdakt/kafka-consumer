import { Module } from "@nestjs/common";

import { ClickHouseModule } from "../clickhouse/clickhouse.module";
import { KafkaModule } from "../kafka/kafka.module";
import { RedisModule } from "../redis/redis.module";

@Module({
    imports: [KafkaModule, RedisModule, ClickHouseModule],
})
export class AppLogsModule {}
