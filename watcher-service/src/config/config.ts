import dotenv from 'dotenv'
import { Config } from './config.interface'
import configValidate from './config.validate'

dotenv.config()

const env = configValidate(process.env)

const config: Config = {
    app: {
        name: env.APP_NAME,
        env: env.APP_ENV,
        port: {
            http: env.APP_PORT_HTTP,
        },
        log: env.APP_LOG,
        locale: env.APP_LOCALE,
    },
    unleash: {
        url: env.UNLEASH_URL,
        app_name: env.UNLEASH_APP_NAME,
        project_name: env.UNLEASH_PROJECT_NAME,
        environment: env.UNLEASH_ENVIRONMENT,
        instance_id: env.UNLEASH_INSTANCE_ID,
        client_api_key: env.UNLEASH_CLIENT_API_KEY,
        admin_api_key: env.UNLEASH_ADMIN_API_KEY,
    },
    bot: {
        telegram: {
            access_token: env.TELEGRAM_BOT_ACCESS_TOKEN,
        },
    },
}

export default config
