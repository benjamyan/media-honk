import { VideoJsPlayerOptions } from 'video.js'

export const vjsConfig: VideoJsPlayerOptions = {
    autoplay: false,
    controls: true,	
    fluid: false,
    liveui: false,
    controlBar: {
        volumePanel: {
            inline: false
        },
        pictureInPictureToggle: false
    },
    muted: false,
    loop: false,
    preload: "metadata",
    nativeControlsForTouch: false,
}
