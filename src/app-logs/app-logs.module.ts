import { Module } from "@nestjs/common";

import { KafkaModule } from "../kafka/kafka.module";
import { RedisModule } from "../redis/redis.module";
import { ClickHouseModule } from "../clickhouse/clickhouse.module";

@Module({
    imports: [KafkaModule, RedisModule, ClickHouseModule],
})
export class AppLogsModule {}
