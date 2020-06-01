import "reflect-metadata";
import {Request} from 'express';
import {inject, injectable} from 'inversify';
import {Authenticator} from "./authenticator";
import {JsonWebToken, JWTOptions} from "./json_web_token";
import {ErrorFactory, IErrorFactory} from "./error_factory";

@injectable()
export abstract class JWTAuthenticator<S = any, D = any> implements Authenticator {

	private unauthenticatedPaths: string[];
	private readonly middleware: (req, res, next) => void;

	protected constructor(@inject(ErrorFactory) private createError: IErrorFactory) {
		this.middleware = this.handle.bind(this);
	}

	async handle(req, res, next) {
		let needsAuth = this.unauthenticatedPaths && !(this.unauthenticatedPaths.find((path) => {
			return req.path.startsWith(path);
		}));

		if (!needsAuth) {
			next();
			return;
		}

		const token = this.getTokenFromRequest(req);
		if (!token) {
			const err = this.createError(401, 'Missing token');
			return next(err);
		}

		try  {
			const decoded = await this.verify(token);
			const data = await this.deserialize(decoded);
			Object.assign(req, {
				user: data
			});
			next();
		} catch (err) {
			console.error(err);
			let error = this.createError(401, 'Token decode failed');
			return next(error);
		}

	}

	verify(token: string): Promise<S> {
		return JsonWebToken.verify(this.getSecret(), token);
	}

	getMiddleware(): (req, res, next) => void {
		return this.middleware;
	}

	protected setUnauthenticatedPaths(paths: string[]) {
		this.unauthenticatedPaths = paths;
	}

	// noinspection JSMethodCanBeStatic
	protected getTokenFromRequest(req: Request): string {
		const header = req.headers.authorization as string;
		if (header && header.startsWith('Bearer')) {
			return header.split('Bearer ')[1];
		}
		if (req.query?.token) {
			return req.query.token as string;
		}
		return null;
	}

	protected abstract getSecret();

	protected abstract getJWTOptions(): JWTOptions;

	async authenticate(req, res, next: Function) {
		const user = await this.findUser(req);
		const data = await this.serialize(user);

		try {
			const token = await this.sign(data, this.getJWTOptions());
			res.send(this.createResponse(user, token));
		} catch(err) {
			console.error(err);
			next(this.createError(401, 'Unauthorized'));
		}
	}

	sign(data, options: JWTOptions): Promise<string> {
		return JsonWebToken.sign(data, this.getSecret(), options);
	}

	abstract findUser(req: Request): Promise<D>;

	protected createResponse(user: D, token: string) {
		return {
			token
		}
	}

	serialize(data: D): Promise<S> {
		return Promise.resolve(data as any);
	}

	deserialize(data: S): Promise<D> {
		return Promise.resolve(data as any);
	}
}
