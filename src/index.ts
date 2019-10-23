import {Server} from 'ffc-node';
import * as viewEngine from 'express-json-views';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';

export abstract class HttpServer extends Server {

	configure() {
		const config = this.getServerConfig();

		this.app.use(bodyParser.urlencoded({extended: false}));
		this.app.use(bodyParser.json({
			strict: false
		}));
		this.app.use(compression());
		this.app.use(cookieParser());

		// CORS Configuration
		console.log(config);
		if (config.corsWhitelist) {
			let originFunc = (config.corsWhitelist === true)
				? true
				: (origin, callback) => {
					console.log('Origin', origin);
					const list: string[] = config.corsWhitelist as any;
					let isOriginWhiteListed = list.indexOf(origin) !== -1;
					callback(null, isOriginWhiteListed);
				};

			let corsOptions = {
				origin: function (origin, callback) {

				},
				credentials: true
			};
			this.app.use(cors(corsOptions));
		}

		this.app.disable('x-powered-by');

		this.app.engine('json', viewEngine({
			helpers: config.viewHelpers
		}));
		this.app.set('views', config.viewDirectory); // specify the views directory
		this.app.set('view engine', 'json'); // register the template engine
		this.app.set('view cache', true); // register the template engine
	}

	protected abstract  getServerConfig(): HttpServiceConfig;

}

export interface HttpServiceConfig {
	viewHelpers?: any;
	viewDirectory?: string;
	corsWhitelist?: string[] | boolean;
}
