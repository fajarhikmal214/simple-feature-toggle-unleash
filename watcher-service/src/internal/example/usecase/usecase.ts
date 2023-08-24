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
        this.on()
        this.off()

        this.telegramBot.launch()
        this.logger.info(`🚀 Bot launched`)

        this.telegramBot.action('help', (ctx) => {
            this.func_help(ctx)
        })

        this.telegramBot.action('status', (ctx) => {
            this.func_status(ctx)
        })

        this.telegramBot.action('on', (ctx) => {
            this.func_on(ctx)
        })

        this.telegramBot.action('off', (ctx) => {
            this.func_off(ctx)
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

    private on() {
        this.telegramBot.command('on', async (ctx) => {
            this.logger.info(ctx.from)

            await this.func_on(ctx)
        })
    }

    private off() {
        this.telegramBot.command('off', async (ctx) => {
            this.logger.info(ctx.from)

            await this.func_off(ctx)
        })
    }

    private async func_start(ctx: any) {
        let message = 'Simple Features Toggle Assist \n \n'
        message += `I'm here to help you enable and disable external services according to your needs \n \n`
        message += `Is there a particular feature you'd like to enable or enable at this time?`

        await this.telegramBot.telegram.sendMessage(ctx.chat.id, message, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Need Help ?',
                            callback_data: 'help',
                        },
                    ],
                    [
                        {
                            text: 'STATUS',
                            callback_data: 'status',
                        },
                    ],
                    [
                        {
                            text: 'ACTIVATE',
                            callback_data: 'on',
                        },
                        {
                            text: 'DEACTIVATE',
                            callback_data: 'off',
                        },
                    ],
                ],
            },
        })
    }

    private async func_help(ctx: any) {
        let message = 'Available commands : \n \n'

        message += '- /start : Starts the bot \n'
        message += '- /help : List of commands \n'

        message += '- /status : Show external service status \n'
        message += `- /on : Activate external service \n`
        message += `- /off : Deactivate external service \n`

        message += '\n'
        message +=
            'Repo : https://github.com/fajarhikmal214/simple-feature-toggle-unleash'

        await this.telegramBot.telegram.sendMessage(ctx.chat.id, message)
    }

    private async func_status(ctx: any) {
        const now = new Date().toLocaleString()

        // Mocking External Service health check (e.g. can ping External Service server)
        const isExternalServiceUp = await this.unleashClient.isEnable(
            this.statusExtServiceFeature
        )

        let message = 'The following is the latest service status update \n \n'
        if (isExternalServiceUp) {
            message += `External Service is *Up*. Response: HTTP 200 - OK. Event occured on ${now} \n \n`
        } else {
            message += `External Service is *Down*. Response: HTTP 500 - Internal Server Error. Event occured on ${now} \n \n`
        }

        const isEnableExtServiceOn = await this.unleashClient.isEnable(
            this.enableExtServiceFeature
        )

        message += `Enable External Service : `
        message += isEnableExtServiceOn ? `Active 🟢` : `Non-Active 🔴`

        this.telegramBot.telegram.sendMessage(ctx.chat.id, message, {
            parse_mode: 'Markdown',
        })
    }

    private async func_on(ctx: any) {
        await this.setFeatureToggle(this.enableExtServiceFeature, 'on')

        this.telegramBot.telegram.sendMessage(
            ctx.chat.id,
            `External Service successfully activated 🟢`,
            { parse_mode: 'Markdown' }
        )
    }

    private async func_off(ctx: any) {
        await this.setFeatureToggle(this.enableExtServiceFeature, 'off')

        this.telegramBot.telegram.sendMessage(
            ctx.chat.id,
            `External Service successfully deactivated 🔴`,
            { parse_mode: 'Markdown' }
        )
    }

    private async func_health_check(ctx: any) {
        const now = new Date().toLocaleString()

        // Mocking External Service health check (e.g. can ping External Service server)
        const isExternalServiceUp = await this.unleashClient.isEnable(
            this.statusExtServiceFeature
        )

        const isEnableExtServiceOn = await this.unleashClient.isEnable(
            this.enableExtServiceFeature
        )

        if (isExternalServiceUp && !isEnableExtServiceOn) {
            await this.setFeatureToggle(this.enableExtServiceFeature, 'on')

            this.telegramBot.telegram.sendMessage(
                ctx.chat.id,
                `External Service is *Up*. Response: HTTP 200 - OK. Event occured on ${now}`,
                { parse_mode: 'Markdown' }
            )
        }

        if (!isExternalServiceUp && isEnableExtServiceOn) {
            await this.setFeatureToggle(this.enableExtServiceFeature, 'off')

            this.telegramBot.telegram.sendMessage(
                ctx.chat.id,
                `External Service is *Down*. Response: HTTP 500 - Internal Server Error. Event occured on ${now}`,
                { parse_mode: 'Markdown' }
            )
        }
    }

    private async func_health_check_gradually(ctx: any) {
        // Run every 1 minute
        setInterval(async () => {
            await this.func_health_check(ctx)
        }, 1 * 60 * 1000)
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

            this.logger.info(
                `Set feature toggle ${feature} to ${status} successfully`
            )
        } catch (error: any) {
            this.logger.error(error.message)
        }
    }
}

export default Usecase
