import { Logger, Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "redis";

export const RedisClient = "REDIS_CLIENT";

export const redisProviders: Provider[] = [
    {
        provide: RedisClient,
        useFactory: async (configService: ConfigService): Promise<any> => {
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
