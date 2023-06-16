import React from 'react';

// import { CloseButton } from '../../components';
import { VrZoom, CustomMenu, CustomCloseButton, CastVideoButton, vjsConfig } from '../../libs/video-js';
import { useMediaPlayerContext } from '../../context';

// https://www.npmjs.com/package/chromecast-api
// https://videojs.com/guides/components/#adding-a-component
// https://medium.com/litslink/node-js-video-streaming-and-segmentation-in-examples-a1f094dbe8ef
import { default as videojs } from 'video.js';
import "video.js/dist/video-js.css";
import '@videojs/themes/dist/city/index.css';
// VR
import 'videojs-vr/dist/videojs-vr.min.js';
import 'videojs-vr/dist/videojs-vr.css';
// Thumbnails
// import 'videojs-sprite-thumbnails/dist/videojs-sprite-thumbnails.min.js'
// Custom
import './_VideoPlayer.scss';
import '../../components/buttons/_Buttons.scss';
import { stream_videoFile } from '../../api/stream_videoFile';
// import '../CastMedia/_CastMedia.scss';

export const VideoPlayer = () => {
	const { selectedMedia, currentMediaId, updateMediaPlayerContext } = useMediaPlayerContext();

	const [playerLoaded, setPlayerLoaded] = React.useState<boolean>(false);
	const videoRef = React.useRef<HTMLVideoElement>(null);
	const playerRef = React.useRef<videojs.Player>();

	const isVR = false; // !!activeVideo.mediaType && activeVideo.mediaType.indexOf('VR') > -1;

	React.useEffect(()=> {
		if (videojs.getComponent('CustomMenu') === undefined) {
			videojs.registerComponent('CustomMenu', CustomMenu);
			videojs.registerComponent('CustomCloseButton', CustomCloseButton);
			// videojs.registerComponent('CastVideoButton', CastVideoButton);
		}
		if (isVR && videojs.getComponent('vrZoom') === undefined) {
			videojs.registerPlugin('vrZoom', VrZoom);
		}
		setPlayerLoaded(true);
	}, []);

	React.useEffect(() => {
		if (playerLoaded && videoRef.current && selectedMedia) {
			playerRef.current = (
				videojs(videoRef.current, {
					...vjsConfig,
					sources: [{ 
						src: stream_videoFile(selectedMedia._guid, currentMediaId).static, 
						type: 'video/mp4' 
					}],
					autoplay: true
				}).ready(function(this) {
					if (isVR) {
						/// @ts-expect-error
						this.vr({
							projection: '180',
							debug: true,
							forceCardboard: false,
							motionControls: false,
							disableTogglePlay: false
						});
						/// @ts-expect-error
						this.vrZoom();
					}
					
					/** Start invoking custom DOM additions after all necessary plugins are loaded*/
					this.addChild('CustomMenu');
					const CustomMenu = this.getChild('CustomMenu') as videojs.Component;
					if (CustomMenu !== undefined && !!CustomMenu) {
						CustomMenu.addChild('CustomCloseButton');
						if (!isVR) CustomMenu.addChild('CastVideoButton');
					}
					
					// Listen for dispose and close entire modal when it happens
					this.on('dispose', ()=> updateMediaPlayerContext({
						action: 'UPDATE',
						payload: { mediaPlaying: false }
					}))
				})
			);
		}
	}, [playerLoaded])

	return (
		<div className={`video__player ${isVR ? 'vr' : ''}`}>
			<video playsInline ref={videoRef} className='video-js vjs-thetrueme-city video__player--media' />
		</div>
	)
}
