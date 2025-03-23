import { Injectable, Logger } from "@nestjs/common";

import { ClickHouseService } from "../../click-house/services/click-house.service";
import { AppLogsTable } from "../../shared/constants/constants";
import { Utils } from "../../shared/utils/utils";

@Injectable()
export class AppLogRepository {
    private readonly logger = new Logger(AppLogRepository.name);

    constructor(private readonly clickHouseService: ClickHouseService) {}

    public async batchInsertToClickhouse<T = any>(logs: T[]): Promise<void> {
        try {
            if (!logs.length) {
                this.logger.debug(`No logs to insert to clickhouse`);
                return;
            }
            this.logger.debug(`inserting the app logs to clickhouse`);
            await Utils.retryOperation(async () => {
                await this.clickHouseService.insert(AppLogsTable, logs);
            });
        } catch (error) {
            this.logger.error(
                "Error while inserting app logs to clickhouse, rolled back the transaction",
                error,
            );
            throw error;
        }
    }
}
