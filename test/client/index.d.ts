import { default as VideoJs, VideoJsPlayer } from "video.js"

declare global {
    interface Window {
        videojs: typeof VideoJs
        // fetch: (url: string, options?: {}) => Promise<any>
    }
    namespace Client {
        declare var honkConfig: {
            ENV: 'staging' | 'development' // | 'production'
        } = {
            ENV
            // ENV: 'staging' | 'development' | 'production'
        }
    }
}
