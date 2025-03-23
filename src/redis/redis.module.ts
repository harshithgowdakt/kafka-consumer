import { Module } from "@nestjs/common";

import { redisProviders } from "./providers/redis.providers";

@Module({
    providers: [...redisProviders],
    exports: [...redisProviders],
})
export class RedisModule {}
