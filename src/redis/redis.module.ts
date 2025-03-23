import { Module } from "@nestjs/common";

import { redisProviders } from "./providers/redis.providers";
import { RedisService } from "./services/redis.service";

@Module({
    providers: [...redisProviders, RedisService],
    exports: [RedisService],
})
export class RedisModule {}
