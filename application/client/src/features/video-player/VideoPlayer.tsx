import React from 'react';

// https://www.npmjs.com/package/chromecast-api
// https://videojs.com/guides/components/#adding-a-component
// https://medium.com/litslink/node-js-video-streaming-and-segmentation-in-examples-a1f094dbe8ef
import { default as VideoJS } from 'video.js';

// import { CloseButton } from '../../components';
import { CustomMenu, CustomCloseButton, vjsConfig } from '../../libs/video-js';
import { useMediaPlayerContext } from '../../context';
import { stream_videoFile } from '../../api/stream_videoFile';

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
// import '../CastMedia/_CastMedia.scss';

export const VideoPlayer = () => {
	const videojs = window.videojs;
	const { selectedMedia, currentMediaId, updateMediaPlayerContext } = useMediaPlayerContext();

	const [playerLoaded, setPlayerLoaded] = React.useState<boolean>(false);
	const videoRef = React.useRef<HTMLVideoElement>(null);
	const playerRef = React.useRef<VideoJS.Player>();
	
	React.useEffect(()=> {
		if (videojs.getComponent('CustomMenu') === undefined) {
			videojs.registerComponent('CustomMenu', CustomMenu);
			videojs.registerComponent('CustomCloseButton', CustomCloseButton);
			// videojs.registerComponent('CastVideoButton', CastVideoButton);
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
					// techOrder: ['java'],
					preload: 'metadata',
					autoplay: false
				}).ready(function(this) {
					/** Start invoking custom DOM additions after all necessary plugins are loaded*/
					this.addChild('CustomMenu');
					const CustomMenu = this.getChild('CustomMenu') as VideoJS.Component;
					if (CustomMenu !== undefined && !!CustomMenu) {
						CustomMenu.addChild('CustomCloseButton');
					}
					/** Listen for dispose and close entire modal when it happens */
					this.on('dispose', ()=> updateMediaPlayerContext({
						action: 'UPDATE',
						payload: { mediaPlaying: false, selectedMediaId: null }
					}));
				})
			);
		}
	}, [playerLoaded]);

	return (
		<div className={`video__player`}>
			<video 
				ref={videoRef} 
				playsInline 
				className='video-js vjs-thetrueme-city video__player--media' 
			/>
			{/* <video ref={videoRef} data-setup='{ "techOrder": ["java"] }' playsInline className='video-js vjs-thetrueme-city video__player--media' /> */}
		</div>
	)
}
