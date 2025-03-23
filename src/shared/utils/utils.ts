import { Logger } from "@nestjs/common";

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
}
