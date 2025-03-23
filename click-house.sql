CREATE TABLE IF NOT EXISTS app_logs (
    `log_timestamp` DateTime64(3, 'Asia/Kolkata'),
    `msg` Nullable(String),
    `hostname` Nullable(String),
    `lvl` LowCardinality(String),
    `app_name` Nullable(String),
    `env` Nullable(String)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(log_timestamp)
ORDER BY log_timestamp
TTL toDateTime(log_timestamp) + INTERVAL 90 DAY;