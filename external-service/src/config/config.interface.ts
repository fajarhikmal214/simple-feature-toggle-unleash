export interface Config {
    app: {
        name: string
        env: string
        port: {
            http: number
        }
        log: string
        locale: string
    }
    unleash: {
        url: string
        app_name: string
        instance_id: string
        api_key: string
    }
}
