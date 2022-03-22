import fetch from 'node-fetch';
import qs from 'querystring';
import { Fields } from './typings/enums';
import { IAdsArchiveItem, IExchangeTokenResponse, IPagingResponse } from './typings/interfaces';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export default class Facebook {

	public static readonly BASE_URL = 'https://graph.facebook.com';

	private _appId: string;

	private _appSecret: string;

	private _accessToken: string;

	private _apiVersion: string;

	constructor(appId: string, appSecret: string, version: string = 'v13.0') {
		this._appId = appId;
		this._appSecret = appSecret;
		this._apiVersion = version;
	}

	public async setAccessToken(accessToken: string, extend: boolean = true): Promise<void> {
		this._accessToken = accessToken;
		if (extend) {
			const data = await this.api<IExchangeTokenResponse>(
				'/oauth/access_token',
				'GET',
				{
					grant_type: 'fb_exchange_token',
					client_id: this._appId,
					client_secret: this._appSecret,
					fb_exchange_token: this._accessToken,
				},
				false,
			);
			this._accessToken = data.access_token;
		}
	}

	public async getAdsArchive(
		countries: string[],
		searchTerms: string,
		limit: number = 25,
		fields: Fields.EAdsArchive[] = [],
		after?: string,
	): Promise<IPagingResponse<IAdsArchiveItem>> {
		if (!fields.length) {
			fields = Object.values(Fields.EAdsArchive);
		}
		const data = await this.api<IPagingResponse<IAdsArchiveItem>>(
			'/ads_archive',
			'GET',
			{
				fields: fields.join(','),
				...countries.reduce((o, country) => {
					return {
						...o,
						'ad_reached_countries[]': country,
					};
				}, {}),
				search_terms: searchTerms,
				after,
				limit,
			},
		);
		return data;
	}

	public async api<T>(
		endpoint: string,
		method: HTTPMethod = 'GET',
		params: Record<string, any> = {},
		sign: boolean = true,
	): Promise<T> {
		let body: Record<string, any>;
		let query: Record<string, any>;
		if (method !== 'GET') {
			body = params;
		} else {
			query = {
				...sign ? { access_token: this._accessToken } : {},
				...params,
			};
		}
		const r = await fetch(
			this._getUrl(endpoint, query),
			{
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			}
		);
		const data = await r.json();
		if (r.status >= 400) {
			throw new Error(data.error?.message || 'Unknown error');
		}
		return data;
	}

	private _getUrl(endpoint: string, params: Record<string, any> = {}): string {
		if (endpoint.indexOf('/') !== 0) {
			endpoint = `/${endpoint}`;
		}
		const url = `${Facebook.BASE_URL}/${this._apiVersion}${endpoint}`;
		if (Object.keys(params).length === 0) {
			return url;
		}
		return `${url}?${qs.stringify(params)}`;
	}
}
