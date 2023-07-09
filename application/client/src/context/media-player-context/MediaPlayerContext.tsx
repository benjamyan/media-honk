import React, { createContext, useContext, useEffect, useState } from 'react';
import { MediaPlayerContextState } from './MediaPlayerContext.types';
import { useAssetLibraryContext } from '../asset-library-context/AssetLibraryContext';

const MediaPlayerContext = createContext<MediaPlayerContextState>(undefined!);

const MediaPlayerContextProvider = ({ children }: {children: React.ReactNode}) => {
    const { assetBucket } = useAssetLibraryContext();
    
    const [ selectedMedia, setSelectedMedia ] = useState<MediaPlayerContextState['selectedMedia']>(null);
    const [ mediaPlaying, setMediaPlaying ] = useState<boolean>(false);
    const [ currentMediaId, setCurrentMediaId ] = useState<number | null>(null);

    const updateMediaPlayerContext: MediaPlayerContextState['updateMediaPlayerContext'] = (params)=> {
        const { payload } = params;
        switch (params.action) {
            case 'UPDATE': {
                console.log(payload)
                if (payload.selectedMediaId !== undefined) {
                    if (!assetBucket) {
                        console.error(`No asset bucket to draw from`);
                        break;
                    }
                    setSelectedMedia(payload.selectedMediaId !== null ? assetBucket[payload.selectedMediaId] : null);
                }
                if (payload.mediaPlaying !== undefined) {
                    setMediaPlaying(payload.mediaPlaying);
                }
                if (payload.currentMediaId !== undefined) {
                    setCurrentMediaId(payload.currentMediaId);
                }
                break;
            }
            default: {
                console.warn(`MediaPlayerContext unknown action passed: ${params.action}`);
            }
        }
    };

    return (
        <MediaPlayerContext.Provider value={{
            selectedMedia,
            currentMediaId,
            mediaPlaying,
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