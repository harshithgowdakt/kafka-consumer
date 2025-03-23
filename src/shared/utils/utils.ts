import * as crypto from "crypto";

import { Logger } from "@nestjs/common";
import * as moment from "moment-timezone";

export class Utils {
    static async retryOperation<T>(
        operation: () => Promise<T>,
        maxAttempts: number = 5,
        baseDelayMs: number = 500,
    ): Promise<T> {
        let lastError: Error | null = null;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                Logger.warn("Error while performing the operation", error);
                lastError = error;

                const maxDelayMs = 30000; // Cap the maximum delay to 30 seconds

                const delay = Math.min(
                    baseDelayMs * Math.pow(2, attempt - 1), // Exponential backoff
                    maxDelayMs,
                ); // Cap delay to maxDelayMs

                Logger.warn(`Retrying operation in ${delay} ms`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        throw lastError;
    }

    static getSha256Hash(...param: (string | number | any[])[]): string {
        const values = param
            .map((p) => {
                if (Array.isArray(p)) {
                    return p.join(",");
                }
                return p !== null && p !== undefined ? p.toString() : null;
            })
            .filter((p) => p !== null)
            .join("-");
        return crypto.createHash("sha256").update(values).digest("hex");
    }

    static formatDateTimeForClickHouse(date: Date): string {
        // Convert the date to UTC and format it as 'YYYY-MM-DD HH:mm:ss'
        return moment(date).utc().format("YYYY-MM-DD HH:mm:ss.SSS");
    }
}
