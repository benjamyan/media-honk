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
    streamVideo: `/stream/video`,
    streamImage: `/stream/image`
}
export const QUERY_PARAMS = {
    getBundles: { 
        type: 'mediatype',
        artist: 'artist',
        category: 'category', 
        limit: 'limit',
        page: 'page',
        id: 'id'
    },
    streamVideo: {
        id: 'id',
        entry: 'entry'
    },
    streamImage: {
        id: 'id',
        entry: 'entry'
    }
    // getBundles: [ 'mediatype', 'artist', 'category', 'limit', 'page' ]
}