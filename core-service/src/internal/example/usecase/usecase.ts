import axios, { AxiosInstance } from 'axios'
import winston from 'winston'
import { Config } from '../../../config/config.interface'
import UnleashClient from '../../../external/unleash-client'

class Usecase {
    private httpClient: AxiosInstance

    constructor(
        private config: Config,
        private logger: winston.Logger,
        private unleashClient: UnleashClient
    ) {
        this.httpClient = axios.create({
            baseURL: this.config.external_service.url,
            timeout: 1000,
        })
    }

    public async ExternalService() {
        const toggle = 'enable.external.service'
        const isEnable = await this.unleashClient.isEnable(toggle)

        if (!isEnable) {
            throw new Error('External service is down, please try again later')
        }

        const result = await this.httpClient.get('/doing-stuff')
        return result.data
    }
}

export default Usecase
