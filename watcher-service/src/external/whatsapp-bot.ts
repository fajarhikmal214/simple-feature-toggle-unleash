import winston from 'winston'
import { Client } from 'whatsapp-web.js'
import * as qrcode from 'qrcode-terminal'
import { Config } from '../config/config.interface'

class WhatsAppBot {
    public static async connect(logger: winston.Logger, config: Config) {
        const client = new Client({
            puppeteer: {
                args: ['--no-sandbox'],
            },
        })

        client.on('qr', (qr) => {
            qrcode.generate(qr, { small: true })
        })

        client.on('ready', () => {
            logger.info('🚀 Connection to whatsapp bot established')
        })

        client.on('message', (message) => {
            logger.info(`Incoming message from whatsapp : ${message.body}`)
        })

        return client
    }
}

export default WhatsAppBot
