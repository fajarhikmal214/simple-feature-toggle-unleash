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
        project_name: string
        environment: string
        instance_id: string
        client_api_key: string
        admin_api_key: string
    }
    bot: {
        telegram: {
            access_token: string
        }
    }
}
