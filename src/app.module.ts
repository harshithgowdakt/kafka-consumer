import { Module } from "@nestjs/common";

import { AppLogsModule } from "./app-logs/app-logs.module";

@Module({
    imports: [AppLogsModule],
})
export class AppModule {}
