import { NextFunction, Request, Response } from 'express'
import winston from 'winston'
import Usecase from '../../usecase/usecase'
import statusCode from '../../../../pkg/statusCode'

class Handler {
    constructor(private usecase: Usecase, private logger: winston.Logger) {}

    public ExternalService() {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const result = await this.usecase.ExternalService()

                this.logger.info('endpoint external service called')
                res.status(statusCode.OK).json(result)
            } catch (error: any) {
                this.logger.error(error.message)
                return next(error)
            }
        }
    }
}

export default Handler
