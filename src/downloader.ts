import BetterQueue from 'better-queue';
import config from 'config';
import { promises as fs } from 'fs';
import { CSV, Logger, sleep } from 'mat-utils';
import { ParquetWriter } from 'parquetjs';
import { createClient, RedisClientType } from 'redis';
import Facebook from './facebook';
import schema from './parquet-schema';
import TokenPool, { ITokenRow } from './token-pool';
import { ISearchData, ISearchInput } from './typings';
import ArchiveWorker from './workers/archive';

const TMP_DIR = './tmp';

export default class Downloader {

	private static _searchInputs: ISearchInput[];

	private static _redis: RedisClientType;

	private static _queue = new BetterQueue(this._exec, {
		concurrent: this.getWorkerConcurrency(),
		maxRetries: 5,
		retryDelay: 1000,
	});

	private static _searchData: Record<string, ISearchData> = {};

	private static _writer: ParquetWriter;

	private static _tokenPool: TokenPool;

	public static async init(): Promise<void> {
		await Promise.all([
			this._connectRedis(),
			this._validateTokens(),
			this._validateSearchInput(),
			this._validateOutputDir(),
			this._createTmpDir(),
			this._clear(),
		]);
		this._writer = await ParquetWriter.openFile(schema, this.getOutDirPath('archive.parquet'));
	}

	public static async start(): Promise<void> {
		return new Promise((resolve, reject) => {
			for (const searchInput of this._searchInputs) {
				this.enqueue(new ArchiveWorker(searchInput));
			}
			this._queue
				.on('drain', async () => {
					await sleep(1000);
					// @ts-ignore
					if (this._queue.length > 0) {
						return;
					}
					resolve();
				})
				.on('error', reject);
		});
	}

	public static async exit(): Promise<void> {
		await this._writer.close();
	}

	public static async writeRow(rowData: any): Promise<void> {
		await this._writer.appendRow(rowData);
	}

	public static enqueue(worker: ArchiveWorker): void {
		let start: number;
		this._queue
			.push(worker)
			.on('started', () => {
				Logger.log('worker', 'Job started', worker.getName(), worker.getData());
				start = Date.now();
			})
			.on('finish', () => {
				Logger.log('worker', 'Job finished', worker.getName(), worker.getData(), `${Date.now() - start}ms`);
			})
			.on('failed', (error) => {
				Logger.log('worker', 'Job failed', error, worker.getName(), worker.getData(), `${Date.now() - start}ms`);
			})
			.on('error', console.error);
	}

	public static async updateSearchData(key: string, searchData: Partial<ISearchData>): Promise<void> {
		const actualData = this._searchData[key];
		this._searchData[key] = {
			...actualData,
			...searchData,
			key,
		};
		await fs.writeFile(this.getSearchDataPath(key), JSON.stringify(this._searchData[key]));
	}

	// #region Getters

	public static async getSearchData(key: string): Promise<ISearchData> {
		if (this._searchData[key]) {
			return this._searchData[key];
		}
		try {
			return JSON.parse((await fs.readFile(this.getSearchDataPath(key))).toString());
		} catch (error) {
			await this.updateSearchData(key, {});
			return this._searchData[key];
		}
	}

	public static async getClient(): Promise<Facebook> {
		const app = this._tokenPool.getApp();
		const fb = new Facebook(app.id, app.secret);
		const { token, extended } = app.getToken();
		await fb.setAccessToken(token, !extended);
		app.setTokenExtended(token);
		return fb;
	}

	public static getWorkerConcurrency(): number {
		return config.get('workerConcurrency');
	}

	public static getOutDirPath(filename: string): string {
		return `${config.get('outDir')}/${filename}`;
	}

	public static getSearchDataPath(key: string): string {
		return `${TMP_DIR}/${key}-data.json`;
	}

	// #endregion

	private static async _exec(worker: ArchiveWorker, cb: (err?: any) => void): Promise<void> {
		try {
			await worker.perform();
			cb();
		} catch (error) {
			cb(error);
		}
	}

	// #region Init

	private static async _clear(): Promise<void> {
		if (!config.get('clear')) {
			return;
		}
		for (const file of await fs.readdir(TMP_DIR)) {
			await fs.unlink(`${TMP_DIR}/${file}`);
		}
		for (const file of await fs.readdir(config.get('outDir'))) {
			await fs.unlink(this.getOutDirPath(file));
		}
	}

	private static async _connectRedis(): Promise<void> {
		if (config.get('redis')) {
			this._redis = createClient(config.get('redis'));
			await this._redis.connect();
		}
	}

	private static async _createTmpDir(): Promise<void> {
		try {
			await fs.access(TMP_DIR);
		} catch (error) {
			await fs.mkdir(TMP_DIR);
		}
	}

	// #region Validators

	private static async _validateTokens(): Promise<void> {
		const rows = await CSV.readFile<ITokenRow>(
			config.get('tokensFilePath'),
		);
		this._tokenPool = new TokenPool(rows.reduce((apps, row) => {
			const index = apps.findIndex(({ id }) => row.id === id);
			if (index >= 0) {
				apps[index].tokens.push(row.token);
			} else {
				apps.push({
					id: row.id,
					secret: row.secret,
					tokens: [row.token],
				});
			}
			return apps;
		}, []));
		if (this._tokenPool.getAppCount() === 0) {
			throw new Error('No tokens');
		}
	}

	private static async _validateSearchInput(): Promise<void> {
		this._searchInputs = await CSV.readFile<ISearchInput>(
			config.get('searchInputFilePath'),
			true,
			(row: { countries: string, search: string }) => {
				return {
					countries: row.countries.split(','),
					search: row.search,
				};
			}
		);
		if (!this._searchInputs.length) {
			throw new Error('The search input cannot be empty.');
		}
	}

	private static async _validateOutputDir(): Promise<void> {
		await fs.access(config.get('outDir'));
	}

	// #endregion

	// #endregion
}
