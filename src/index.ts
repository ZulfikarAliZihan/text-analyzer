import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as morgan from 'morgan';
import { Container } from 'typedi';
import * as express from 'express';
import { useContainer as ormUseContainer } from 'typeorm';
import { useExpressServer, useContainer as routingUseContainer } from 'routing-controllers';
import { AppDataSource } from './data-source'
import { AppLogger } from './utils/app-logger'
import * as swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from './swagger.json';

dotenv.config();
const logger = new AppLogger();

async function bootstrap() {
    try {

        routingUseContainer(Container);
        ormUseContainer(Container);
        await AppDataSource.initialize();
        logger.info('Data Source has been initialized!');

        const app = express();

        app.use(morgan('dev'))

        useExpressServer(app, {
            controllers: [__dirname + '/controllers/*.ts'],
            routePrefix: '/api/v1',
            validation: true,
            classTransformer: true,
            defaultErrorHandler: true
        });

        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
            logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
        });

    } catch (error) {
        logger.error(`Application initialization failed :${error}`);
        process.exit(1);
    }
}

bootstrap();