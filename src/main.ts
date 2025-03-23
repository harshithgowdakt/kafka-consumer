import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    await app.listen(process.env.PORT ?? 3000);
}

process.env.TZ = "UTC";
const logger = new Logger("Bootstrap");
bootstrap()
    .then(() => logger.log(`[Nest Server Started]`))
    .catch((error) =>
        logger.error(`Error while starting the application ${error}`),
    );
