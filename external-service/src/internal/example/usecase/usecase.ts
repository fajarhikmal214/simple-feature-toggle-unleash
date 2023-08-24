import winston from 'winston'
import { Config } from '../../../config/config.interface'
import UnleashClient from '../../../external/unleash-client'

class Usecase {
    constructor(
        private config: Config,
        private logger: winston.Logger,
        private unleashClient: UnleashClient
    ) {}

    public async DoingStuff() {
        // Mocking External Service status
        const toggle = 'external.service.status'
        const isEnable = await this.unleashClient.isEnable(toggle)

        if (!isEnable) {
            await this.delay(5000)
            throw new Error('External service is down')
        }

        return 'External service doing stuff'
    }

    private delay(ms: number) {
        return new Promise((resolve, _reject) => {
            setTimeout(() => {
                resolve(null)
            }, ms)
        })
    }
}

export default Usecase
