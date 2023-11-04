import React, { createContext, useContext, useReducer, useState } from 'react';
import { MediaPlayerContextState } from './MediaPlayerContext.types';
// import { useAssetLibraryContext } from '../';

const MediaPlayerContext = createContext<MediaPlayerContextState>(undefined!);

const MediaPlayerContextProvider = ({ children }: {children: React.ReactNode}) => {
    // const { assetBucket } = useAssetLibraryContext();
    // const initialMediaContextState = {
    //     selectedMedia: null,
    //     mediaPlaying: false,
    //     currentMediaId: null,
    //     mediaQueue: []
    // }
    // const [ mediaContext, updateMediaPlayerContext ] = useReducer((state, params)=> {
    //     let _state = { ...state };
    //     switch (params.action) {
    //         case 'RESET': {
    //             setSelectedMedia(null);
    //             setMediaPlaying(false);
    //             setCurrentMediaId(null);
    //             break;
    //         }
    //         case 'UPDATE': {
    //             const { payload } = params;
                
    //             if (payload.selectedMediaId !== undefined) {
    //                 if (!assetBucket) {
    //                     console.error(`No asset bucket to draw from`);
    //                     break;
    //                 }
    //                 setSelectedMedia(payload.selectedMediaId !== null ? assetBucket[payload.selectedMediaId] : null);
    //             }
    //             if (payload.mediaPlaying !== undefined) {
    //                 setMediaPlaying(payload.mediaPlaying);
    //             }
    //             if (payload.currentMediaId !== undefined) {
    //                 setCurrentMediaId(payload.currentMediaId);
    //             }
    //             if (payload.mediaQueue !== undefined) {
    //                 if (payload.mediaQueue === null) {
    //                     setMediaQueue([]);
    //                 } else if (mediaQueue.includes(payload.mediaQueue)) {
    //                     mediaQueue.splice(mediaQueue.findIndex((searchValue)=> searchValue == payload.mediaQueue), 1);
    //                     setMediaQueue([...mediaQueue]);
    //                 } else {
    //                     setMediaQueue([...mediaQueue, payload.mediaQueue])
    //                 }
    //             }
    //             break;
    //         }
    //         default: {
    //             console.warn(`MediaPlayerContext unknown action passed`);
    //             // console.warn({...params});
    //         }
    //     }
    //     return _state
    // },
    // initialMediaContextState);

    const [ selectedMedia, setSelectedMedia ] = useState<MediaPlayerContextState['selectedMedia']>(null);
    const [ mediaPlaying, setMediaPlaying ] = useState<boolean>(false);
    const [ currentMediaId, setCurrentMediaId ] = useState<number | null>(null);
    const [ mediaQueue, setMediaQueue ] = useState<string[]>([]);

    const updateMediaPlayerContext: MediaPlayerContextState['updateMediaPlayerContext'] = (params)=> {

        switch (params.action) {
            case 'RESET': {
                setSelectedMedia(null);
                setMediaPlaying(false);
                setCurrentMediaId(null);
                break;
            }
            case 'UPDATE': {
                const { payload } = params;
                
                // if (payload.selectedMediaId !== undefined) {
                //     if (!assetBucket) {
                //         console.error(`No asset bucket to draw from`);
                //         break;
                //     }
                //     setSelectedMedia(payload.selectedMediaId !== null ? assetBucket[payload.selectedMediaId] : null);
                // }

                if (payload.selectedMedia !== undefined) {
                    setSelectedMedia(payload.selectedMedia);
                }
                if (payload.mediaPlaying !== undefined) {
                    setMediaPlaying(payload.mediaPlaying);
                }
                if (payload.currentMediaId !== undefined) {
                    setCurrentMediaId(payload.currentMediaId);
                }
                if (payload.mediaQueue !== undefined) {
                    if (payload.mediaQueue === null) {
                        setMediaQueue([]);
                    } else if (mediaQueue.includes(payload.mediaQueue)) {
                        mediaQueue.splice(mediaQueue.findIndex((searchValue)=> searchValue == payload.mediaQueue), 1);
                        setMediaQueue([...mediaQueue]);
                    } else {
                        setMediaQueue([...mediaQueue, payload.mediaQueue])
                    }
                }
                break;
            }
            default: {
                console.warn(`MediaPlayerContext unknown action passed`);
                // console.warn({...params});
            }
        }
    };

    return (
        <MediaPlayerContext.Provider value={{
            selectedMedia,
            currentMediaId,
            mediaPlaying,
            mediaQueue,
            updateMediaPlayerContext
        }}>
            { children }
        </MediaPlayerContext.Provider>
    )
}

const useMediaPlayerContext = ()=> {
    try {
        const context = useContext(MediaPlayerContext);
        if (context === undefined) {
            throw new Error('An unhandled exception occured in useMediaPlayerContext');
        }
        return context
    } catch (err) {
        console.error(err)
        return {} as MediaPlayerContextState
    }
}

export {
    useMediaPlayerContext,
    MediaPlayerContextProvider
}