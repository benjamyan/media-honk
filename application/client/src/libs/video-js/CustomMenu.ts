import { VideoHTMLAttributes } from 'react';
import { default as VideoJS } from 'video.js';
// import { CastMedia } from '../../features';
// import { CastOptionsModal } from '../../features/CastMedia/components/CastOptionsModal';

const Component = VideoJS.getComponent('Component');
const ClickableComponent = VideoJS.getComponent('ClickableComponent');

export class CustomMenu extends Component {
    constructor(player: VideoJS.Player, options: VideoJS.PlayerOptions = {}) {
        super(player, options)
        const toggleActiveClass = (on?: boolean): void => {
            if (on) {
                if (this.hasClass('active')) return;
                this.addClass('active')
            } else {
                if (player.paused()) return;
                if (!this.hasClass('active')) return;
                this.removeClass('active')
            }
        }
        player.on('play', toggleActiveClass.bind(null, true));
        player.on('pause', toggleActiveClass.bind(null, true));
        player.on('seeked', toggleActiveClass.bind(null, true));
        player.on('useractive', toggleActiveClass.bind(null, true));
        player.on('userinactive', toggleActiveClass.bind(null, false));
        player.on('error', toggleActiveClass.bind(null, true));
    }
    createEl() {
        return VideoJS.dom.createEl('div', {
            className: `vjs-custom-menu video__player--control`
        })
    }
}

export class CustomCloseButton extends ClickableComponent {
    private playerInstance: VideoJS.Player;

    constructor(player: VideoJS.Player, options: VideoJS.PlayerOptions = {}) {
        super(player, options)
        this.playerInstance = player;
    }
    createEl() {
        return VideoJS.dom.createEl('div', {
            className: `vjs-custom-clickable-component button__close video__player--control-close`
        })
    }
    handleClick(_event: VideoJS.EventTarget.Event): void {
        // videojs(videoRef.current).dispose()
        // playerRef.current?.dispose()
        console.log('dispose')
        this.playerInstance.dispose()
    }
}

export class CastVideoButton extends ClickableComponent {
    constructor(player: VideoJS.Player, options: VideoJS.PlayerOptions = {}) {
        super(player, options)
    }
    createEl() {
        return VideoJS.dom.createEl('div', {
            className: `vjs-custom-clickable-component cast__button video__player--control-cast`
        })
    }
    handleClick(_event: VideoJS.EventTarget.Event): void {
        console.log('CAST');
        // CastMedia({ isOpen: true })
        // return CastMedia
        /// @ts-expect-error
        this.player.honkForceVR();
    }
}