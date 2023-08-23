import winston from 'winston'
import { Config } from '../../../config/config.interface'
import UnleashClient from '../../../external/unleash-client'

class Usecase {
    constructor(
        private config: Config,
        private logger: winston.Logger,
        private unleashClient: UnleashClient
    ) {}

    public async ExternalService() {
        const toggle = 'external.service.status'
        const isEnable = await this.unleashClient.isEnable(toggle)

        if (!isEnable) {
            throw new Error('External service is down, please try again later')
        }

        return 'Forwarding request to external service...'
    }
}

export default Usecase
