import { Module } from "@nestjs/common";

import { AppLogsModule } from "./app-logs/app-logs.module";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), AppLogsModule],
})
export class AppModule {}
