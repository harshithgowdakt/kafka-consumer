import { Module } from "@nestjs/common";

import { ClickHouseModule } from "../click-house/click-house.module";
import { KafkaModule } from "../kafka/kafka.module";
import { RedisModule } from "../redis/redis.module";
import { AppLogRepository } from "./repositories/app-log.repository";
import { AppLogService } from "./services/app-logs.service";

@Module({
    imports: [KafkaModule, RedisModule, ClickHouseModule],
    providers: [AppLogService, AppLogRepository],
})
export class AppLogsModule {}
