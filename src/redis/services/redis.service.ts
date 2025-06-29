import { Inject, Injectable, Logger } from "@nestjs/common";
import { RedisClientType } from "redis";

import { RedisClient } from "../providers/redis.providers";

@Injectable()
export class RedisService {
    private readonly logger = new Logger(RedisService.name);

    constructor(
        @Inject(RedisClient)
        private readonly redisClient: RedisClientType,
    ) {}

    async setValue(key: string, value: string): Promise<void> {
        try {
            await this.redisClient.set(key, value);
        } catch (error) {
            this.logger.warn(`Error setting value in Redis: ${error}`);
        }
    }

    async getValue(key: string): Promise<string | null> {
        try {
            return await this.redisClient.get(key);
        } catch (error) {
            this.logger.warn(`Error getting value from Redis: ${error}`);
            return null;
        }
    }

    async setValueWithTtl(key: string, value: any, ttl = 60): Promise<void> {
        try {
            await this.redisClient.set(key, value, { EX: ttl });
        } catch (error) {
            this.logger.warn(`Error setting value in Redis: ${error}`);
        }
    }
}
