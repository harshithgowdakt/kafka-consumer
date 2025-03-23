import { Logger, Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "redis";

export const REDIS_CLIENT = "REDIS_CLIENT";

export const redisProviders: Provider[] = [
    {
        provide: REDIS_CLIENT,
        useFactory: async (configService: ConfigService) => {
            const logger = new Logger("RedisProvider");

            const client = createClient({
                url: `redis://${configService.get<string>("REDIS_HOST")}:${configService.get<number>("REDIS_PORT")}`,
            });

            client.on("error", (err) =>
                logger.error("Redis Client Error", err),
            );

            await client.connect();
            return client;
        },
    },
];
