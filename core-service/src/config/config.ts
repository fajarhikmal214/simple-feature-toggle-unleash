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
        instance_id: env.UNLEASH_INSTANCE_ID,
        api_key: env.UNLEASH_API_KEY,
    },
}

export default config
