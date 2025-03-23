import { Module } from "@nestjs/common";

import { ClickHouseService } from "./services/click-house.service";
import { RedisModule } from "../redis/redis.module";

@Module({
    imports: [RedisModule],
    providers: [ClickHouseService],
    exports: [ClickHouseService],
})
export class ClickHouseModule {}
