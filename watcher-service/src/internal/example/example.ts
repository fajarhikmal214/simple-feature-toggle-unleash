import winston from 'winston'
import { Context, Telegraf } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import { Config } from '../../config/config.interface'
import Usecase from './usecase/usecase'
import UnleashClient from '../../external/unleash-client'

class Example {
    constructor(
        private logger: winston.Logger,
        private config: Config,
        private unleashClient: UnleashClient,
        private telegramBot: Telegraf<Context<Update>>
    ) {
        const usecase = new Usecase(
            this.config,
            this.logger,
            this.unleashClient,
            this.telegramBot
        )

        usecase.launch()
    }
}

export default Example
