import {
    ClickHouseClient,
    createClient,
    InsertResult,
} from "@clickhouse/client";
import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { RedisService } from "../../redis/services/redis.service";
import { NodeEnv } from "../../shared/constants/constants";
import { Utils } from "../../shared/utils/utils";

@Injectable()
export class ClickHouseService implements OnModuleInit, OnModuleDestroy {
    private client: ClickHouseClient;
    private readonly logger = new Logger(ClickHouseService.name);
    private readonly cacheExpiryTime: number;
    private readonly environment: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
    ) {
        this.client = createClient({
            url: this.configService.getOrThrow("CLICKHOUSE_HOST"),
            username: this.configService.getOrThrow("CLICKHOUSE_USERNAME"),
            password: this.configService.getOrThrow("CLICKHOUSE_PASSWORD"),
            database: this.configService.getOrThrow("CLICKHOUSE_DATABASE"),
            max_open_connections:
                Number(
                    this.configService.get<number>(
                        "CLICKHOUSE_MAX_CONNECTIONS",
                    ),
                ) ?? 50,
            application: "app-logs-consumer",
        });
        this.cacheExpiryTime =
            this.configService.get<number>("REDIS_TTL") ?? 2 * 60 * 1000; // 2 minutes
        this.environment =
            this.configService.get<string>("NODE_ENV") ?? NodeEnv.LOCAL;
    }

    async onModuleInit(): Promise<void> {
        this.logger.log("ClickHouse client initialized");
    }

    async onModuleDestroy(): Promise<void> {
        await this.client.close();
        this.logger.log("ClickHouse client closed");
    }

    async query(
        sql: string,
        params: Record<string, unknown>,
    ): Promise<unknown[]> {
        const hashKey = Utils.getSha256Hash(
            this.environment,
            sql,
            ...(Object.values(params) as any),
        );

        const cacheResponse = await this.redisService.getValue(hashKey);
        if (cacheResponse) {
            this.logger.debug(
                "Found a response in the Redis cache for this query. Returning cached response.",
            );
            return JSON.parse(cacheResponse);
        }

        const result = await this.client.query({
            query: sql,
            query_params: params,
            format: "JSON",
        });
        const response = (await result.json()).data;

        await this.redisService.setValueWithTtl(
            hashKey,
            JSON.stringify(response),
            this.cacheExpiryTime,
        );
        return response;
    }

    async insert<T = any>(table: string, values: T[]): Promise<InsertResult> {
        return this.client.insert({
            table,
            values,
            format: "JSONEachRow",
        });
    }
}
