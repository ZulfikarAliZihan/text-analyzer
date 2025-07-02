import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { Container } from 'typedi';
import * as express from 'express';
import { useContainer as ormUseContainer } from 'typeorm';
import { useExpressServer, useContainer as routingUseContainer } from 'routing-controllers';
import { AppDataSource } from './data-source'

dotenv.config();

async function bootstrap() {
    try {
        routingUseContainer(Container);
        ormUseContainer(Container);
        await AppDataSource.initialize();
        console.log('✅ Data Source has been initialized!');

        const app = express();

        app.use(express.json());

        useExpressServer(app, {
            controllers: [__dirname + '/controllers/*.ts'],
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        });

    } catch (error) {
        console.error('Application initialization failed:', error);
        process.exit(1);
    }
}

bootstrap();