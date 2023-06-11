export const HONK_URL = {
    local: 'http://192.168.0.11:8081'
}
export const QUERY_PARAMS = {
    getBundles: { 
        mediatype: 'mediatype',
        artist: 'artist',
        category: 'category', 
        limit: 'limit',
        page: 'page',
        id: 'id'
    }
    // getBundles: [ 'mediatype', 'artist', 'category', 'limit', 'page' ]
}
export const ENDPOINTS = {
    local: {
        getMeta: `${HONK_URL.local}/media/meta`,
        getMediaTypes: `${HONK_URL.local}/media/types`,
        getBundles: `${HONK_URL.local}/media/bundles`,
        getCoverImage: `${HONK_URL.local}/resource/cover`,
        streamFile: `${HONK_URL.local}/stream`
    }
}