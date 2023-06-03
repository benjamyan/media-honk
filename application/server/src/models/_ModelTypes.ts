import { BundleMediaModel } from "./BundleMediaModel";
import { BundlesModel } from "./BundlesModel";
import { CoversModel } from "./CoversModel";
import { MediaMetaModel } from "./MediaMetaModel";
import { MediaModel } from "./MediaModel";
import { MetaModel } from "./MetaModel";

export type ModelTables = {
	meta: MetaModel;
    media_meta: MediaMetaModel;
    media: MediaModel;
    bundles: BundlesModel;
    bundles_media: BundleMediaModel;
    covers: CoversModel;
}

export interface MetaModelColumns {
	id: number;
	artist_name: string | null;
	artist_id: number | null;
	category_name: string | null;
	category_id: number | null;
}

export interface MediaMetaModelColumns {
	id: number;
    media_id: number;
	meta_artist_id?: number | null;
	meta_category_id?: number | null;
}

export interface MediaModelColumns {
	id: number;
	title: string;
	abs_url: string;
	cover_img_id?: number;
	media_type: string;
}

export interface BundlesModelColumns {
	id: number;
	main_title: string;
	sub_title: string;
	custom_cover_id?: number;
}

export interface CoversModelColumns {
	id: number;
	file_url: string;
	source_id: number;
}

export interface BundlesMediaModelColumns {
	bundle_id: number;
    media_id: number;
    media_index?: number | null;
}
