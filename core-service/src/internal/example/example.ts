import winston from 'winston'
import { Config } from '../../config/config.interface'
import Http from '../../transport/http/http'
import Handler from './delivery/http/handler'
import Usecase from './usecase/usecase'
import UnleashClient from '../../external/unleash-client'

class Example {
    constructor(
        private http: Http,
        private logger: winston.Logger,
        private config: Config,
        private unleashClient: UnleashClient
    ) {
        const usecase = new Usecase(
            this.config,
            this.logger,
            this.unleashClient
        )

        this.loadHttp(usecase)
    }

    private loadHttp(usecase: Usecase) {
        const handler = new Handler(usecase, this.logger)

        this.http.app.get('/external-service', handler.ExternalService())
    }
}

export default Example
