import { randomNumber } from 'mat-utils';
import App from './app';

export interface ITokenRow {
	id: string;
	secret: string;
	token: string;
}

export interface IToken {
	token: string;
	extended?: boolean;
}

export interface IApp {
	id: string;
	secret: string;
	tokens: string[];
}

export default class TokenPool {

	private _apps: App[];

	constructor(apps: IApp[]) {
		if (!apps.length || !apps[0].tokens.length) {
			throw new Error('The token pool requires at least one application and token.');
		}
		this._apps = apps.map((app) => new App(app.id, app.secret, app.tokens));
	}

	public getApp(): App {
		return this._apps[randomNumber(0, this._apps.length - 1)];
	}

	public getAppCount(): number {
		return this._apps.length;
	}
}
