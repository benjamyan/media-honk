import { Honk } from 'mediahonk';
import videojs from 'video.js';
import ClientModel from '../model';
import ClientView from '../view';

interface IControllerProps {
    Model: typeof ClientModel;
    View: typeof ClientView;
}

type MediaFilterOptions = {
    sources: string[];
    categories: string[];
    artists: string[];
}

type ControllerState = {
    activeMedia: string | null;
    activeFilters: {
        source: string | null;
        categories: string[];
        artists: string[];
    };
    scrollPosition: number;
}


export default class Controller {
    private Model: ClientModel = null!;
    private View: ClientView = null!;

    private mediaLibrary: Record<string, any> = {};
    private mediaFilterOptions: MediaFilterOptions = {
        sources: [],
        categories: [],
        artists: []
    };
    private state: ControllerState = {
        activeMedia: null,
        activeFilters: {
            source: null,
            categories: [],
            artists: []
        },
        scrollPosition: 0
    };
    
    constructor(props: IControllerProps) {
        this.Model = new props.Model();
        this.View = new props.View();
        
    }

    public async init() {
        // Instanciate api connection
        this.Model.init();
        // Get library entries from api and store it in state
        this.mediaLibrary = 
            this.Model.libraryContentFactory(
                await this.Model.get.libraryContent()
            )
            .reduce(
                (entries, entry)=> ({ ...entries, [entry.uuid]: {...entry} }), 
                {}
            );

        // Filter and add the data to search and filter aggregates
        let currentEntry: Honk.Media.BasicLibraryEntry;
        for (const entry in this.mediaLibrary) {
            currentEntry = this.mediaLibrary[entry];
            if (!this.mediaFilterOptions.sources.includes(currentEntry.sourceUrl as string)) {
                this.mediaFilterOptions.sources.push(currentEntry.sourceUrl as string)
            }
            currentEntry.categories?.forEach((category)=>{
                if (!this.mediaFilterOptions.categories.includes(category)) {
                    this.mediaFilterOptions.categories.push(category)
                }
            })
            currentEntry.artists?.forEach((artist)=>{
                if (!this.mediaFilterOptions.artists.includes(artist)) {
                    this.mediaFilterOptions.sources.push(artist)
                }
            })
        }

        // If the user allowed spec view, set the active source
        if (this.mediaFilterOptions.sources.length > 0) {
            this.state.activeFilters.source = this.mediaFilterOptions.sources[0];
        }

        // Await dom and load our View
        const initViewDom = ()=> {
            // this.View.init();
            this.View.addLibraryEntries(this.mediaLibrary);

            for (const entry in this.View.nodes.mediaNodeTree) {
                this.View.nodes.mediaNodeTree[entry].addEventListener('click', ()=> {
                    this.handleMediaLibraryEntryClick(entry)
                });
            }
            
        }
        if (document.readyState !== 'loading') {
            initViewDom();
        } else {
            document.addEventListener('DOMContentLoaded', ()=> {
                initViewDom();
            })
        }
    }

    public handleActiveMediaItemClose() {
        this.state.activeMedia = null;
        this.View.clearActiveMediaItem();
        this.View.destroyGenericMediaPlayer();
    }

    private handleMediaLibraryEntryClick(uuid: string) {
        
        this.state.activeMedia = uuid;
        this.state.scrollPosition = window.scrollY;
        this.View.state = {
            activeMedia: this.mediaLibrary[uuid],
            mediaType: this.View.getActiveMediaType(),
            currentEntry: null,
            _ready: false
        }
        
        if (this.View.state.activeMedia && this.View.state.mediaType) {
            switch (this.View.state.mediaType) {
                case 'AUDIO': {

                    break;
                }
                case 'IMAGE': {

                    break;
                }
                case 'VIDEO': {
                    this.setupVideoPlayerView();
                    break;
                }
                default: {
                    // handle errror
                    this.View.state._ready = new Error(`An unhandled exception occured`)
                }
            }
            this.View.nodes.mediaWrapper.hidden = false;
            this.View.state._ready = true;
        } else {
            this.View.state._ready = new Error(`An unhandled exception occured`)
        }
        
    }

    private setupVideoPlayerView() {
        this.View.buildVideoPlayer();
        
        if (this.View.nodes.mediaPlayer && this.View.state.activeMedia) {
            this.View.state.currentEntry = Object.values(this.View.state.activeMedia.mediaUrl)[0];
            this.View.invokeVideoJsPlayer();
            videojs.on(this.View.nodes.mediaPlayer, 'dispose', ()=> {
                this.handleActiveMediaItemClose();
            });
        } else {
            this.View.state._ready = new Error(`An unhandled exception occured`)
        }
    }

}
