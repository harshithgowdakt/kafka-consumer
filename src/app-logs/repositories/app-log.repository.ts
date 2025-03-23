import { Injectable, Logger } from "@nestjs/common";

import { ClickHouseService } from "../../clickhouse/services/clickhouse.service";
import { AppLogsTable } from "../../shared/constants/constants";
import { Utils } from "../../shared/utils/utils";

@Injectable()
export class AppEventLogRepository {
    private readonly logger = new Logger(AppEventLogRepository.name);
    constructor(private readonly clickHouseService: ClickHouseService) {}

    public async batchInsertToClickhouse<T = any>(logs: T[]): Promise<void> {
        try {
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
