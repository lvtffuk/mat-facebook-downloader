import config from 'config';
import Downloader from '../downloader';
import { ISearchInput } from '../typings';

export default class ArchiveWorker {

	protected _data: ISearchInput;

	constructor(data: ISearchInput) {
		this._data = data;
	}

	public async perform(): Promise<void> {
		const { countries, search } = this._data;
		const fb = await Downloader.getClient();
		const searchData = await Downloader.getSearchData(this.getKey());
		if (searchData.after === null) {
			return;
		}
		const { data, paging } = await fb.getAdsArchive(
			countries,
			search,
			config.get('adsArchiveLimit'),
			[],
			searchData.after,
		);
		for (const item of data) {
			await Downloader.writeRow(item);
		}
		if (paging?.cursors?.after) {
			await Downloader.updateSearchData(this.getKey(), { after: paging.cursors.after });
			Downloader.enqueue(this);
			return;
		}
		await Downloader.updateSearchData(this.getKey(), { after: null });
	}

	public getName(): string {
		return this.constructor.name;
	}

	public getData(): ISearchInput {
		return this._data;
	}

	public getKey(): string {
		const { countries, search } = this._data;
		return `${countries.join('-')}_${search}`;
	}
}
