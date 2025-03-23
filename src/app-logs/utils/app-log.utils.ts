import { Utils } from "../../shared/utils/utils";

export class AppLogUtils {
    static getLogClickhouse(log: any): any {
        return {
            log_timestamp:
                Utils.formatDateTimeForClickHouse(log.timestamp) ??
                Utils.formatDateTimeForClickHouse(new Date().toISOString()),
            app_name: log.appName,
            env: log.env,
            hostname: log.hostname,
            lvl: log.level,
            msg: log.message,
        };
    }
}
