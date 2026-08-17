import { createApp } from "./app.js";
import { config } from "./config/env.js";
import { logger } from "./lib/logger.js";

createApp().listen(config.port, ()=> {
    logger.info({ port: config.port }, 'backend running');
})