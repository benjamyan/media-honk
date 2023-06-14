export const HONK_URL = {
    development: 'http://192.168.0.11:8081',
    staging: 'http://192.168.0.11:8080'
}
export const ENDPOINTS = {
    healthCheck: '/health',
    getMeta: `/media/meta`,
    getMediaTypes: `/media/types`,
    getBundles: `/media/bundles`,
    getCoverImage: `/resource/cover`,
    streamFile: `/stream`
}
export const QUERY_PARAMS = {
    getBundles: { 
        type: 'type',
        artist: 'artist',
        category: 'category', 
        limit: 'limit',
        page: 'page',
        id: 'id'
    }
    // getBundles: [ 'mediatype', 'artist', 'category', 'limit', 'page' ]
}