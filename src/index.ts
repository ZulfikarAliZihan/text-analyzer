import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as morgan from 'morgan';
import { Container } from 'typedi';
import * as express from 'express';
import { useContainer as ormUseContainer } from 'typeorm';
import { useExpressServer, useContainer as routingUseContainer } from 'routing-controllers';
import { AppDataSource } from './data-source'
import { AppLogger } from './utils/app-logger'

dotenv.config();
const logger = new AppLogger();

async function bootstrap() {
    try {

        routingUseContainer(Container);
        ormUseContainer(Container);
        await AppDataSource.initialize();
        logger.info('Data Source has been initialized!');

        const app = express();

        app.use(express.json());
        app.use(morgan('dev'))

        useExpressServer(app, {
            controllers: [__dirname + '/controllers/*.ts'],
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`)
        });

    } catch (error) {
        logger.error(`Application initialization failed :${error}`);
        process.exit(1);
    }
}

bootstrap();