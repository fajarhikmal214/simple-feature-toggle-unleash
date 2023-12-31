import { Telegraf } from 'telegraf'
import winston from 'winston'
import { Config } from '../config/config.interface'

class TelegramBot {
    public static async connect(logger: winston.Logger, config: Config) {
        const connect = new Telegraf(config.bot.telegram.access_token).catch(
            (e: any) => {
                logger.error(e.message)
                process.exit(-1)
            }
        )

        logger.info('🚀 Connection to telegram bot established')
        return connect
    }
}

export default TelegramBot
