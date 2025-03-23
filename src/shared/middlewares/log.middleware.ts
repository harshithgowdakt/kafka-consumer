import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger("Http");

    use(req: Request, res: Response, next: NextFunction): void {
        const { method, originalUrl, body, headers, ip } = req;
        const start = Date.now();

        this.logger.log(
            `method=${method} path=${originalUrl} ip=${ip} user-agent=${headers["user-agent"]} ` +
                `body=${JSON.stringify(body)}`,
        );

        res.on("finish", () => {
            const { statusCode } = res;
            const duration = Date.now() - start;
            this.logger.log(
                `method=${method} path=${originalUrl} status=${statusCode} duration=${duration}ms contentLength=${
                    res.get("content-length") || 0
                }`,
            );
        });

        next();
    }
}
