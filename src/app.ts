import { randomNumber } from 'mat-utils';

export interface IToken {
	token: string;
	extended: boolean;
}

export default class App {

	public id: string;

	public secret: string;

	public tokens: IToken[];

	constructor(id: string, secret: string, tokens: string[]) {
		this.id = id;
		this.secret = secret;
		this.tokens = tokens.map((token) => ({ token, extended: false }));
	}

	public getToken(): IToken {
		return this.tokens[randomNumber(0, this.tokens.length - 1)];
	}

	public setTokenExtended(token: string): void {
		const t = this.tokens.find((item) => token === item.token);
		t.extended = true;
	}
}
