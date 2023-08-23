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
        return 'External service doing stuff'
    }
}

export default Usecase
