export interface IExchangeTokenResponse {
	access_token: string;
	bearer: string;
	expires_in: number;
}

export interface IAdsArchiveItem {
	id: string;
	ad_creation_time: string;
	ad_creative_bodies: string[];
	ad_creative_link_captions: string[];
	ad_creative_link_descriptions: string[];
	ad_creative_link_titles: string[];
	ad_delivery_start_time: string;
	ad_delivery_stop_time: string;
	ad_snapshot_url: string;
	bylines: string;
	currency: string;
	delivery_by_region: { percentage: string, region: string }[];
	demographic_distribution: { percentage: string, age: string, gender: string }[];
	estimated_audience_size: IInsightsRangeValue;
	impressions: IInsightsRangeValue;
	languages: string[];
	page_id: string;
	page_name: string;
	publisher_platforms: string[];
	spend: IInsightsRangeValue;
}

export interface IPagingResponse<T> {
	data: T[];
	paging: {
		cursors?: {
			after: string;
		};
		next?: string;
	};
}

export interface IInsightsRangeValue {
	lower_bound: string;
	upper_bound: string;
}