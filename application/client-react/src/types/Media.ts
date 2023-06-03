export interface BaselineMediaStreamData {
    url: string;
    length: number;
}
export interface MediaFilters {
    mediaSource: string | 'ALL';
    categories: string[];
    actors: string | 'ANY';
    search: string;
}
export interface CastingDevice {
    name: string;
    friendlyName: string;
    host: string;
}
