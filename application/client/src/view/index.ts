import { Honk, constants } from 'mediahonk';
import videojs from 'video.js';
import { CastVideoButton, CustomCloseButton, CustomMenu, vjsConfig } from './libs/video-js';
import "./styles/_ClientEntry.scss";
import "./styles/_VideoPlayer.scss";
import "video.js/dist/video-js.css";
import '@videojs/themes/dist/city/index.css';
import Controller from '../controller';

// type ViewState = Record<string, boolean | number | string>;
type ViewState = {
    activeMedia: Honk.Media.BasicLibraryEntry | null;
    currentEntry: string | null;
    mediaType: 'IMAGE' | 'AUDIO' | 'VIDEO' | null;
    _ready: boolean | Error ;
};
type ViewNodes = {
    mediaWrapper: HTMLDivElement;
    mediaPlayer: undefined | HTMLVideoElement;
    // videoPlayer: HTMLVideoElement;
    mediaLibrary: HTMLDivElement;
    mediaNodeTree: Record<string, HTMLDivElement>;
    pluginModal: HTMLElement;
};

export default class View {
    public state: ViewState = null!;
    public nodes: ViewNodes = null!;

    constructor() {
        
        this.nodes = {
            mediaWrapper: document.getElementById('mediaPlayer') as ViewNodes['mediaWrapper'],
            mediaPlayer: undefined,
            mediaLibrary: document.getElementById('mediaLibrary') as ViewNodes['mediaLibrary'],
            mediaNodeTree: {},
            pluginModal: document.getElementById('plugin')  as ViewNodes['pluginModal']
        };

        this.state = {
            activeMedia: null,
            mediaType: null!,
            currentEntry: null,
            _ready: true
        };
        
    }

    public init() {
        // Instanciate our DOM elements and assign them to local `nodes` var
        
    }
    
    public clearActiveMediaItem() {
        this.state = {
            mediaType: null,
            activeMedia: null,
            currentEntry: null,
            _ready: true
        }
        this.nodes.mediaWrapper.hidden = true;
    }
    
    public addLibraryEntries(givenMediaData: Record<string, Honk.Media.BasicLibraryEntry>) {
        try {
            const entryData = Object.values(givenMediaData); 
            let entryNode: HTMLDivElement = document.createElement('div'),
                newNode: HTMLDivElement;
            entryNode.className = 'media__library--entry';
            for (const entry of entryData) {
                if (!this.nodes.mediaNodeTree[entry.uuid]) {
                    newNode = entryNode.cloneNode(true) as HTMLDivElement;
                    newNode.innerHTML = `
                        <img alt="${entry.title}" src="${!!entry.coverImageUri ? entry.relativeUrl + '/' + entry.coverImageUri : ''}" />
                        <div>
                            <h4>${entry.title}</h4>
                            <p>${entry.subtitle || ""}</p>
                        </div>
                    `;
                    this.nodes.mediaLibrary.insertAdjacentElement('beforeend', newNode);
                    this.nodes.mediaNodeTree[entry.uuid] = newNode;
                }
            }
            entryNode.remove();
        } catch (err) {
            console.log(err);
        }
    }

    public getActiveMediaType(): ViewState['mediaType'] {
        // TODO
        // this.state.mediaType = 'VIDEO';

        return 'VIDEO'
    }

    public buildVideoPlayer() {
        const videoPlayer = document.createElement('video');

        videoPlayer.className = 'video-js vjs-thetrueme-city media__player--vjs';
        videoPlayer.setAttribute('playsinline','');

        this.nodes.mediaWrapper.insertAdjacentElement('beforeend', videoPlayer);
        this.nodes.mediaPlayer = videoPlayer;
    }

    public destroyGenericMediaPlayer() {
        this.nodes.mediaPlayer = undefined;
        this.nodes.mediaWrapper.hidden = true;
    }

    public invokeVideoJsPlayer() {
        
        // TODO support for AVI/MKV/etc
        // TODO fix linking for src and poster
        videojs.registerComponent('CustomMenu', CustomMenu);
        videojs.registerComponent('CustomCloseButton', CustomCloseButton);
        videojs.registerComponent('CastVideoButton', CastVideoButton);
        videojs(this.nodes.mediaPlayer, {
            ...vjsConfig,
            // poster: `/server/image?file=${this.state.activeMedia?.coverImageUri}`,
            sources: [
                {
                    src: `http://192.168.0.11:81/server/video?file=${this.state.activeMedia?.baseUrl + '/' + this.state.currentEntry as string}`,
                    type: `video/${this.state.currentEntry?.split('.').at(-1)}`
    
                }
            ]
        })
            .ready(function (this) {

                /** Start invoking custom DOM additions after all necessary plugins are loaded*/
                this.addChild('CustomMenu');
                const CustomMenu = this.getChild('CustomMenu') as videojs.Component;
                if (CustomMenu !== undefined && !!CustomMenu) {
                    CustomMenu.addChild('CustomCloseButton')
                }
                
                // Listen for dispose and close entire modal 
                // this.on('dispose', ()=> _self.destroyVideoPlayer());
            })
    }

}

