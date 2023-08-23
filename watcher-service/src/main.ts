import config from './config/config'
import Logger from './pkg/logger'
import Http from './transport/http/http'
import Example from './internal/example/example'
import Unleash from './external/unleash-client'
import TelegramBot from './external/telegram-bot'

const main = async () => {
    const { logger } = new Logger(config)
    const http = new Http(logger, config)
    const unleash = new Unleash(logger, config)
    const telegramBot = await TelegramBot.connect(logger, config)

    // Load internal apps
    new Example(logger, config, unleash, telegramBot)

    if (config.app.env !== 'test') {
        http.Run(config.app.port.http)
    }

    return {
        http,
    }
}

export default main()
