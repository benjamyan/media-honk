import { default as videojs } from 'video.js';

const Plugin = videojs.getPlugin('plugin');
export class VrZoom extends Plugin {
    readonly player: videojs.Player
    readonly options: {
        minFov: number;
        maxFov: number;
        defaultFov: number;
    };
    touch: {
        evCache: any[];
        prevDiff: number;
        active: boolean;
    }
    vr: any | undefined

    constructor(player: videojs.Player) {
        super(player);
        this.player = player;
        this.options = Object.assign({
            minFov: 30,
            maxFov: 115,
            defaultFov: 70
        });
        this.touch = {
            evCache: [],
            prevDiff: -1,
            active: false
        }
        this.vr = undefined
        this.setup();
    }

    /**
     * If video is playing and you use mouse wheel video will zoom.
     * @param event
     */
    private zoomHandlerWeb(event: any) {
        if (this.player.paused()) {
            return;
        }
        event.preventDefault();
        const isWheelUp = event.deltaY < 0;
        let fov = this.vr.camera.fov - (isWheelUp ? -1 : 1);

        if (fov < this.options.minFov) {
            fov = this.options.minFov;
        }

        if (fov > this.options.maxFov) {
            fov = this.options.maxFov;
        }

        this.vr.camera.fov = fov;
        this.vr.camera.updateProjectionMatrix();
    }

    private zoomHandlerTouch(event: any) {

        if (this.player.paused()) {
            return;
        }
        event.preventDefault();
        // console.log('touch zoom')
        /// @ts-expect-error
        const vr = this.player.vr();
        console.log(event)
        // let hypo = undefined;
        // console.log(ev)
        // if (event.targetTouches.length === 2) {
        // 	// alert('pinch')
        // 	let hypo1 = Math.hypot((event.targetTouches[0].pageX - event.targetTouches[1].pageX),
        // 		(event.targetTouches[0].pageY - event.targetTouches[1].pageY));
        // 	if (hypo === undefined) {
        // 		hypo = hypo1;
        // 	}
        // 	let fov = vr.camera.fov - (hypo1 / hypo);
        // 	if (fov < this.options.minFov) {
        // 		fov = this.options.minFov;
        // 	}

        // 	if (fov > this.options.maxFov) {
        // 		fov = this.options.maxFov;
        // 	}
        // 	vr.camera.fov = fov;
        // 	vr.camera.updateProjectionMatrix();
        // }
    }

    private pointerdownHandler(ev: Event) {
        // The pointerdown event signals the start of a touch interaction.
        // This event is cached to support 2-finger gestures
        // console.log(ev.type, ev);
        // if (this.touch.active) return
        // this.touch.active = true;
        console.log(ev)
        this.touch.evCache.push(ev);
    }
    private pointermoveHandler(ev: any) {
        // This function implements a 2-pointer horizontal pinch/zoom gesture.
        //
        // If the distance between the two pointers has increased (zoom in),
        // the target element's background is changed to "pink" and if the
        // distance is decreasing (zoom out), the color is changed to "lightblue".
        //
        // This function sets the target element's border to "dashed" to visually
        // indicate the pointer's target received a move event.
        // log("pointerMove", ev);
        if (!ev.target) {
            return
        }
        // ev.target.style.border = "dashed";
        // ev.target.style.border = '5px solid'
        // Find this event in the cache and update its record with this event
        const index = this.touch.evCache.findIndex(
            (cachedEv) => cachedEv.pointerId === ev.pointerId
        );
        this.touch.evCache[index] = ev;
        // console.log(ev.type, ev);
        // If two pointers are down, check for pinch gestures
        if (this.touch.evCache.length === 2) {
            if (this.touch.active) return;
            this.touch.active = true;
            setTimeout(()=>{
                this.touch.active = false
            }, 5)
            // Calculate the distance between the two pointers
            const curDiff = Math.abs(this.touch.evCache[0].clientX - this.touch.evCache[1].clientX);
            // console.log('pinching');
            // ev.target.style.borderWidth = '10px'
            if (this.touch.prevDiff > 0) {
                // if (curDiff > this.touch.prevDiff) {
                // 	// The distance between the two pointers has increased
                // 	console.log("Pinch moving OUT -> Zoom in", ev);
                // 	ev.target.style.borderColor = "pink";
                // }
                // if (curDiff < this.touch.prevDiff) {
                // 	// The distance between the two pointers has decreased
                // 	console.log("Pinch moving IN -> Zoom out", ev);
                // 	ev.target.style.borderColor = "lightblue";
                // }

                // / @ts-expect-error
                // const vr = this.player.vr();
                const isWheelUp = curDiff < this.touch.prevDiff;
                let fov = this.vr.camera.fov - (isWheelUp ? -1 : 1);

                if (fov < this.options.minFov) {
                    fov = this.options.minFov;
                }

                if (fov > this.options.maxFov) {
                    fov = this.options.maxFov;
                }

                this.vr.camera.fov = fov;
                this.vr.camera.updateProjectionMatrix();
            }

            // Cache the distance for the next move event
            this.touch.prevDiff = curDiff;
        }
    }

    // private removeEvent(ev: any) {
    // 	// Remove this event from the target's cache
    // 	const index = this.touch.evCache.findIndex(
    // 		(cachedEv) => cachedEv.pointerId === ev.pointerId
    // 	);
    // 	this.touch.evCache.splice(index, 1);
    //   }
    private resetPointerHandler(ev: any) {
        // console.log(ev.type, ev);
        // Remove this pointer from the cache and reset the target's
        // background and border
        // this.removeEvent(ev);
        const index = this.touch.evCache.findIndex(
            (cachedEv) => cachedEv.pointerId === ev.pointerId
        );
        this.touch.evCache.splice(index, 1);

        // If the number of pointers down is less than two then reset diff tracker
        if (this.touch.evCache.length < 2) {
            this.touch.prevDiff = -1;
        }
        this.touch.active = false

        // ev.target.style.border = 'none'
    }

    private setup() {
        const $video = this.player.el();
        if (!videojs.browser.TOUCH_ENABLED) {
            $video.addEventListener('wheel', this.zoomHandlerWeb.bind(this), {
                passive: true
            });
        } else {
            // $video.addEventListener('click', this.pointerdownHandler.bind(this))

            $video.addEventListener('pointerdown', this.pointerdownHandler.bind(this), {
                passive: true
            })
            $video.addEventListener('pointermove', this.pointermoveHandler.bind(this), {
                passive: true
            })

            $video.addEventListener('pointerup', this.resetPointerHandler.bind(this), {
                passive: true
            })
            $video.addEventListener('pointercancel', this.resetPointerHandler.bind(this), {
                passive: true
            })
            $video.addEventListener('pointerleave', this.resetPointerHandler.bind(this), {
                passive: true
            })
            $video.addEventListener('pointerout', this.resetPointerHandler.bind(this), {
                passive: true
            })
        }
        /// @ts-expect-error
        this.vr = this.player.vr()
    }
}