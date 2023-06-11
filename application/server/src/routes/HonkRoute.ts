import { default as Express } from 'express';
import { RouteBase } from './_RouteBase';

export class HonkRoutes extends RouteBase {
    
    constructor() {
        super({
            permittedQuery: {},
            permittedBody: {},
            requiredHeader: {}
        });

        this.logger('- Established /');
        this.app.use('/health', [ this.healthCheck ]);

    }

    private healthCheck(_req: Express.Request, res: Express.Response): void {
        try {
            res.sendStatus(200)
            return;
        } catch (err) {
            this.emit('error', 'Bad health check')
        }
    }
    

}
