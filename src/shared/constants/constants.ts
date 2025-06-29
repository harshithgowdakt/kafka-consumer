export enum NodeEnv {
    LOCAL = "local",
    DEV = "dev",
    UAT = "uat",
    PROD = "prod",
}

export const CircuitBreakerConfig = {
    timeout: 60000, // If the query takes longer than  1 minute, trigger failure
    errorThresholdPercentage: 50, // Open the circuit if 50% of queries fail
    resetTimeout: 30000, // Wait for 30 seconds before attempting to close the circuit
};

export const AppEventLogsConsumerConfig = {
    groupId: "app-logs-consumer",
    maxBytesPerPartition: 2048000, // Maximum bytes to fetch per partition (2MB)
    maxBytes: 2048000, // Maximum total bytes per fetch (2MB)
    minBytes: 102400, // Minimum bytes before returning a batch (default is 100KB)
    maxWaitTimeInMs: 3000, // Maximum wait time to accumulate messages (3 seconds)
    sessionTimeout: 60000, // kafka consider consumer is dead if doesn't send the heartbeat in 60000 ms (60s)
};

// Interval to check and resume paused consumers every 3 minutes (specified in milliseconds)
export const ConsumerResumeInterval = 3 * 60000;

export enum KafkaBaseTopic {
    APP_LOGS = "app-logs",
}

export const AppLogsTable = "app_logs";
