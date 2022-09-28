import React from 'react';

// import { CloseButton } from '../../components';
import { MediaLibraryEntry } from '../../types';
import { VrZoom, CustomMenu, CustomCloseButton, CastVideoButton, vjsConfig } from '../../libs/video-js';
// import { CastMedia } from '../';

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
import '../../components/Buttons/_Buttons.scss';
import '../CastMedia/_CastMedia.scss';

interface VideoPlayerProps {
	activeVideo: MediaLibraryEntry;
	closeVideo: () => void;
}

export const VideoPlayer = (playerProps: VideoPlayerProps) => {
	const { activeVideo } = playerProps;

	const [playerLoaded, setPlayerLoaded] = React.useState<boolean>(false);
	const videoRef = React.useRef<HTMLVideoElement>(null);
	const playerRef = React.useRef<videojs.Player>();

	const isVR: boolean = !!activeVideo.mediaType && activeVideo.mediaType.indexOf('VR') > -1;

	React.useEffect(() => {
		if (videojs.getComponent('CustomMenu') === undefined) {
			videojs.registerComponent('CustomMenu', CustomMenu);
			videojs.registerComponent('CustomCloseButton', CustomCloseButton);
			videojs.registerComponent('CastVideoButton', CastVideoButton);
		}
		if (isVR && videojs.getComponent('vrZoom') === undefined) {
			videojs.registerPlugin('vrZoom', VrZoom);
		}
		setPlayerLoaded(true)
	}, []);

	React.useEffect(() => {
		if (videoRef.current !== null && playerLoaded) {
			playerRef.current = (
				videojs(videoRef.current, {
					...vjsConfig,
					poster: `/server/image?file=${activeVideo.coverImageUrl}`,
					sources: [
						{
							src: `/server/video?file=${activeVideo.videoUrl}`,
							type: 'video/mp4'
			
						}
					],
					muted: isVR ? true : false
				})
					.ready(function (this) {
						if (isVR) {
							/// @ts-expect-error
							this.vr({
								projection: '180',
								debug: true,
								forceCardboard: false,
								motionControls: false,
								disableTogglePlay: false
							})
							/// @ts-expect-error
							this.vrZoom();
						}

						/** Start invoking custom DOM additions after all necessary plugins are loaded*/
						this.addChild('CustomMenu');
						const CustomMenu = this.getChild('CustomMenu') as videojs.Component;
						if (CustomMenu !== undefined && !!CustomMenu) {
							CustomMenu.addChild('CustomCloseButton')
							if (!isVR) {
								CustomMenu.addChild('CastVideoButton')
							}
						}
						
						// Listen for dispose and close entire modal when it happens
						this.on('dispose', ()=> playerProps.closeVideo())
					})
			);
		}
	}, [playerLoaded])

	return (
		<div className={`video__player ${isVR ? 'vr' : ''}`}>
			<video ref={videoRef} playsInline className='video-js vjs-thetrueme-city video__player--media' />
		</div>
	)
}
