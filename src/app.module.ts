import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppLogsModule } from "./app-logs/app-logs.module";

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), AppLogsModule],
})
export class AppModule {}
