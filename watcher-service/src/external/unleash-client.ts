import winston from 'winston'
import { Unleash, startUnleash } from 'unleash-client'
import { Config } from '../config/config.interface'

class UnleashClient {
    private unleash!: Unleash

    constructor(private logger: winston.Logger, private config: Config) {
        this.setup()
    }

    private async setup() {
        this.unleash = await startUnleash({
            url: this.config.unleash.url,
            appName: this.config.unleash.app_name,
            instanceId: this.config.unleash.instance_id,
            customHeaders: {
                Authorization: this.config.unleash.client_api_key,
            },
        })
        this.logger.info(`🚀 Unleash Client Connected`)
    }

    public async isEnable(key: string) {
        return this.unleash.isEnabled(key)
    }
}

export default UnleashClient
