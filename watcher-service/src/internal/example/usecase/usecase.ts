import winston from 'winston'
import { Context, Telegraf } from 'telegraf'
import axios, { AxiosRequestConfig } from 'axios'
import { Update } from 'telegraf/typings/core/types/typegram'
import { Config } from '../../../config/config.interface'
import UnleashClient from '../../../external/unleash-client'

class Usecase {
    private statusExtServiceFeature = 'external.service.status'
    private enableExtServiceFeature = 'enable.external.service'

    constructor(
        private config: Config,
        private logger: winston.Logger,
        private unleashClient: UnleashClient,
        private telegramBot: Telegraf<Context<Update>>
    ) {}

    public launch() {
        // Load all commands
        this.start()
        this.help()

        this.status()

        this.telegramBot.launch()
        this.logger.info(`🚀 Bot launched`)

        this.telegramBot.action('help', (ctx) => {
            this.func_help(ctx)
        })
    }

    private start() {
        this.telegramBot.command('start', async (ctx) => {
            this.logger.info(ctx.from)

            await this.func_start(ctx)
            await this.func_health_check_gradually(ctx)
        })
    }

    private help() {
        this.telegramBot.command('help', async (ctx) => {
            this.logger.info(ctx.from)

            await this.func_help(ctx)
        })
    }

    private status() {
        this.telegramBot.command('status', async (ctx) => {
            this.logger.info(ctx.from)

            await this.func_status(ctx)
        })
    }

    private async func_start(ctx: any) {
        await this.telegramBot.telegram.sendMessage(
            ctx.chat.id,
            `Hello ${ctx.from.first_name}, Nice to meet you! 👋`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Need Help ?',
                                callback_data: 'help',
                            },
                        ],
                    ],
                },
            }
        )
    }

    private async func_help(ctx: any) {
        let message = 'Available commands : \n \n'

        message += '- /start : Starts the bot \n'
        message += '- /help : List of commands \n'
        message += '- /status : Show external service status \n'

        message += '\n'
        message +=
            'Repo : https://github.com/fajarhikmal214/simple-feature-toggle-unleash'

        await this.telegramBot.telegram.sendMessage(ctx.chat.id, message)
    }

    private async func_status(ctx: any) {
        const now = new Date().toLocaleString()

        // Mocking External Service health check (could be ping the External Service server)
        const isExternalServiceUp = await this.unleashClient.isEnable(
            this.statusExtServiceFeature
        )

        if (isExternalServiceUp) {
            this.telegramBot.telegram.sendMessage(
                ctx.chat.id,
                `External Service is *Up*. Response: HTTP 200 - OK. Event occured on ${now}`,
                { parse_mode: 'Markdown' }
            )

            return
        }

        this.telegramBot.telegram.sendMessage(
            ctx.chat.id,
            `External Service is *Down*. Response: HTTP 500 - Internal Server Error. Event occured on ${now}`,
            { parse_mode: 'Markdown' }
        )
    }

    private async func_health_check(ctx: any) {
        const now = new Date().toLocaleString()

        const isExternalServiceUp = await this.unleashClient.isEnable(
            this.statusExtServiceFeature
        )
        const isEnableExtServiceOn = await this.unleashClient.isEnable(
            this.enableExtServiceFeature
        )

        if (isExternalServiceUp && !isEnableExtServiceOn) {
            await this.setFeatureToggle(this.enableExtServiceFeature, 'off')

            this.telegramBot.telegram.sendMessage(
                ctx.chat.id,
                `External Service is *Up*. Response: HTTP 200 - OK. Event occured on ${now}`,
                { parse_mode: 'Markdown' }
            )
        }

        if (!isExternalServiceUp && isEnableExtServiceOn) {
            await this.setFeatureToggle(this.enableExtServiceFeature, 'on')

            this.telegramBot.telegram.sendMessage(
                ctx.chat.id,
                `External Service is *Down*. Response: HTTP 500 - Internal Server Error. Event occured on ${now}`,
                { parse_mode: 'Markdown' }
            )
        }
    }

    private async func_health_check_gradually(ctx: any) {
        setInterval(async () => {
            await this.func_health_check(ctx)
        }, 1 * 60 * 1000) // Run every 1 minute
    }

    private async setFeatureToggle(feature: string, status: 'on' | 'off') {
        try {
            const config = this.config.unleash

            const url = `${config.url}/admin/projects/${config.project_name}/features/${feature}/environments/${config.environment}/${status}`
            const header: AxiosRequestConfig = {
                headers: {
                    Authorization: config.admin_api_key,
                    'Content-Type': 'application/json',
                },
            }

            await axios.post(url, {}, header)
        } catch (error: any) {
            this.logger.error(error.message)
        }
    }
}

export default Usecase
