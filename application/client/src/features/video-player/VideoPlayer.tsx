import React from 'react';


// import { CloseButton } from '../../components';
import { CustomMenu, CustomCloseButton, vjsConfig, CastVideoButton, VrZoom } from '../../libs/video-js';
import { useMediaPlayerContext } from '../../context';
import { stream_videoFile } from '../../api/stream_videoFile';

// https://www.npmjs.com/package/chromecast-api
// https://videojs.com/guides/components/#adding-a-component
// https://medium.com/litslink/node-js-video-streaming-and-segmentation-in-examples-a1f094dbe8ef
import { default as videojs } from 'video.js';
// VR
// import VideoJsVr from 'videojs-vr/src/plugin';
import 'videojs-vr/dist/videojs-vr.min.js';
// import { default as VideoJsVr } from 'videojs-vr/dist/videojs-vr.min.js';
// import { default as VideoJsVr } from 'videojs-vr/dist/videojs-vr.js';
import "video.js/dist/video-js.css";
import '@videojs/themes/dist/city/index.css';
import 'videojs-vr/dist/videojs-vr.css';
// Thumbnails
// import 'videojs-sprite-thumbnails/dist/videojs-sprite-thumbnails.min.js'
// Custom
import './_VideoPlayer.scss';
import '../../components/buttons/_Buttons.scss';
// import '../CastMedia/_CastMedia.scss';

export const VideoPlayer = () => {
	// const videojs = window.videojs;
	const { selectedMedia, currentMediaId, updateMediaPlayerContext } = useMediaPlayerContext();

	const [playerLoaded, setPlayerLoaded] = React.useState<boolean>(false);
	const videoRef = React.useRef<HTMLVideoElement>(null);
	const playerRef = React.useRef<videojs.Player>();
	
	React.useEffect(()=> {
		if (videojs.getComponent('CustomMenu') === undefined) {
			videojs.registerComponent('CustomMenu', CustomMenu);
			videojs.registerComponent('CustomCloseButton', CustomCloseButton);
			// videojs.registerComponent('CastVideoButton', CastVideoButton);
		}
		if (selectedMedia.category.includes('VR') && videojs.getPlugin('vrZoom') === undefined) {
			videojs.registerPlugin('vrZoom', VrZoom);
		}
		// if (selectedMedia.category.includes('VR') && videojs.getPlugin('vr') === undefined) {
		// 	videojs.registerPlugin('vr', VideoJsVr);
		// }
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
					preload: 'auto',
					// preload: 'none',
					// preload: 'metadata',
					autoplay: false,
					
					muted: selectedMedia.category.includes('VR')
				}).ready(function(this) {
					if (selectedMedia.category.includes('VR')) {						
						try {
							/// @ts-expect-error
							this.vr({
								projection: '180',
								debug: true,
								forceCardboard: true,
								motionControls: true,
								disableTogglePlay: false
							});
							/// @ts-expect-error
							this.vrZoom();
						} catch (err) {
							console.log(err)
						}
					}
					/** Start invoking custom DOM additions after all necessary plugins are loaded*/
					this.addChild('CustomMenu');
					const CustomMenu = this.getChild('CustomMenu') as videojs.Component;
					if (CustomMenu !== undefined && !!CustomMenu) {
						CustomMenu.addChild('CustomCloseButton');
						// CustomMenu.addChild('CastVideoButton');
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
		<div className={`video__player ${selectedMedia.category.includes('VR') ? 'vr' : ''} `}>
			<video 
				ref={videoRef} 
				playsInline 
				crossOrigin="anonymous"
				className={`video-js vjs-thetrueme-city video__player--media`}
			/>
			{/* <video ref={videoRef} data-setup='{ "techOrder": ["java"] }' playsInline className='video-js vjs-thetrueme-city video__player--media' /> */}
		</div>
	)
}

// interface VideoPlayerProps {
// 	activeVideo: any //MediaLibraryEntry;
// 	closeVideo: () => void;
// }
// interface VideoJsPlayerProps extends VideoPlayerProps {
// 	isVR: boolean;
// 	resetVideo: (toggleVr?: boolean) => void;
// }

// type DebugValues = {
// 	device: string;
// 	webVrSupport: boolean;
// 	filename: string | undefined;
// 	framerate: number;
// }
// const debugPlayer: boolean = false;

// export const VideoJsPlayer = (playerProps: VideoJsPlayerProps) => {
// 	const { activeVideo, isVR } = playerProps;
// 	const [ debugValue, setDebugValue ] = React.useState<DebugValues | null>(!debugPlayer ? null : {
// 		device: 'todo',
// 		webVrSupport: false,
// 		filename: playerProps.activeVideo.videoUrl,
// 		framerate: 0
// 	});
// 	const [ playerLoaded, setPlayerLoaded ] = React.useState<boolean>(false);
// 	const videoRef = React.useRef<HTMLVideoElement>(null);
// 	const playerRef = React.useRef();
// 	const { selectedMedia, currentMediaId, updateMediaPlayerContext } = useMediaPlayerContext();

// 	React.useEffect(() => {
// 		if (videojs.getComponent('CustomMenu') === undefined) {
// 			videojs.registerComponent('CustomMenu', CustomMenu);
// 			videojs.registerComponent('CustomCloseButton', CustomCloseButton);
// 			videojs.registerComponent('isVRButton', CastVideoButton);
// 		}
// 		if (isVR && videojs.getPlugin('vrZoom') === undefined) {
// 			videojs.registerPlugin('vrZoom', VrZoom);
// 		}
// 		setPlayerLoaded(true)
// 	}, []);

// 	React.useEffect(() => {
// 		if (videoRef.current !== null && playerLoaded) {
// 			/// @ts-expect-error
// 			playerRef.current = (
// 				videojs(videoRef.current, {
// 					...vjsConfig,
// 					sources: [{ 
// 						src: stream_videoFile(selectedMedia._guid, currentMediaId).static, 
// 						type: 'video/mp4' 
// 					}],
// 					muted: isVR ? true : false
// 				})
// 					/// @ts-expect-error
// 					.ready( function(this: videojs.Player & CustomVjsInstance ) {
// 						// console.log(navigator.xr)
// 						// console.log(this)
// 						if (isVR) {
							
// 							// / @ts-expect-error
// 							this.vr({
// 								projection: '180',
// 								debug: true,
// 								forceCardboard: true,
// 								motionControls: true,
// 								disableTogglePlay: false
// 							});
							
// 							// / @ts-expect-error
// 							this.vrZoom();
// 						}
						
// 						// / @ts-expect-error
// 						this.player.shouldClosePlayer = true;
// 						// / @ts-expect-error
// 						this.player.honkForceVR = ()=> {
// 							// setClosePlayer(false);
// 							// / @ts-expect-error
// 							this.player.shouldClosePlayer = false;
// 							this.dispose();
// 						}
// 						// / @ts-expect-error
// 						this.player.honkClosePlayer = ()=> {
// 							// setVR()
// 							// setClosePlayer(true);

// 							// / @ts-expect-error
// 							this.player.shouldClosePlayer = true;
// 							this.dispose();
// 						}
						
// 						/** Start invoking custom DOM additions after all necessary plugins are loaded*/
// 						this.addChild('CustomMenu');
// 						const CustomMenu = this.getChild('CustomMenu') as videojs.Component;
// 						if (CustomMenu !== undefined && !!CustomMenu) {
// 							CustomMenu.addChild('CustomCloseButton');
// 							CustomMenu.addChild('isVRButton');
// 						}
						
// 						// Listen for dispose and close entire modal when it happens
// 						this.on('dispose', ()=> {
// 							// / @ts-expect-error
// 							if (this.player.shouldClosePlayer) {
// 								updateMediaPlayerContext({
// 								   action: 'UPDATE',
// 								   payload: { mediaPlaying: false, selectedMediaId: null }
// 							   });
// 								// playerProps.closeVideo();
// 							} else {
// 								setPlayerLoaded(false);
// 								playerProps.resetVideo(true);
// 							}
// 						})
// 					})
// 			);
// 		}
// 	}, [ playerLoaded ])

// 	return (
// 		<>
// 			<div className={`video__player ${isVR ? 'vr' : ''}`}>
// 				<video ref={ videoRef } playsInline className='video-js vjs-thetrueme-city video__player--media' />
// 			</div>
// 		</>
// 	)
// }

// export const VideoPlayer = (playerProps: VideoPlayerProps)=> {
// 	// const { activeVideo } = playerProps;
// 	const { selectedMedia, currentMediaId, updateMediaPlayerContext } = useMediaPlayerContext();

// 	const [ reset, setReset] = React.useState<boolean>(false);

// 	const [ video, setVideo ] = React.useState({...selectedMedia});
// 	const [ isVR, setVR ] = React.useState<boolean>(!!selectedMedia.type && selectedMedia.type.indexOf('VR') > -1);
	
// 	React.useEffect(()=>{
// 		if (reset === true) {
// 			setTimeout(function(){
// 				setVideo({...selectedMedia});
// 				setReset(false);
// 			}, 500)
// 		}
// 	}, [ reset ])
	
// 	return (
// 		reset
// 			? <>resetting...</>
// 			: 
// 			<VideoJsPlayer 
// 				isVR={isVR} 
// 				activeVideo={{...video}}
// 				resetVideo={(toggleVr?: boolean)=>{
// 					if (toggleVr !== undefined) {
// 						setVR(!isVR);
// 					}
// 					setReset(true)
// 				}}
// 				closeVideo={ playerProps.closeVideo }
// 			/>
// 	)
// }