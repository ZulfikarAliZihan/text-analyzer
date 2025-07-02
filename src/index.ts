import 'reflect-metadata';
import * as express from 'express';
import { useExpressServer } from 'routing-controllers';

async function bootstrap() {
    try {
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