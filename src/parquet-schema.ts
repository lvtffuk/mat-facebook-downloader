import { ParquetField as Field } from 'mat-utils';
import { ParquetSchema } from 'parquetjs';

export default new ParquetSchema({
	id: Field.string.required(),
	ad_creation_time: Field.string,
	ad_creative_bodies: Field.arrayOf(Field.string),
	ad_creative_link_captions: Field.arrayOf(Field.string),
	ad_creative_link_descriptions: Field.arrayOf(Field.string),
	ad_creative_link_titles: Field.arrayOf(Field.string),
	ad_delivery_start_time: Field.string,
	ad_delivery_stop_time: Field.string,
	ad_snapshot_url: Field.string,
	bylines: Field.string,
	currency: Field.string,
	delivery_by_region: Field.map({
		percentage: Field.float,
		region: Field.string,
	}, true),
	demographic_distribution: Field.map({
		percentage: Field.float,
		gender: Field.string,
		age: Field.string,
	}, true),
	estimated_audience_size: Field.map({
		lower_bound: Field.integer,
		upper_bound: Field.integer,
	}),
	impressions: Field.map({
		lower_bound: Field.integer,
		upper_bound: Field.integer,
	}),
	languages: Field.arrayOf(Field.string),
	page_id: Field.string,
	page_name: Field.string,
	publisher_platforms: Field.arrayOf(Field.string),
	spend: Field.map({
		lower_bound: Field.integer,
		upper_bound: Field.integer,
	}),
});
