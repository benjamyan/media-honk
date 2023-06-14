import React, { createContext, useContext, useEffect, useState } from 'react';
import { MediaPlayerContextState } from './MediaPlayerContext.types';
import { useAssetLibraryContext } from '../asset-library-context/AssetLibraryContext';

const MediaPlayerContext = createContext<MediaPlayerContextState>(undefined!);

const MediaPlayerContextProvider = ({ children }: {children: React.ReactNode}) => {
    const { assetBucket } = useAssetLibraryContext();
    const [ mediaPlaying, setMediaPlaying ] = useState<boolean>(false);
    // const [ playerType, setPlayerType ] = useState<MediaPlayerContextState['playerType']>(null);
    // const [ bundleId, setBundleId ] = useState<MediaPlayerContextState['bundleId']>(null);
    const [ selectedMedia, setSelectedMedia ] = useState<MediaPlayerContextState['selectedMedia']>(null);

    const updateMediaPlayerContext: MediaPlayerContextState['updateMediaPlayerContext'] = (params)=> {
        const { payload } = params;
        switch (params.action) {
            case 'UPDATE': {
                if (payload.selectedMediaId !== undefined) {
                    if (!assetBucket) {
                        console.error(``);
                        break;
                    }
                    setSelectedMedia(payload.selectedMediaId !== null ? assetBucket[payload.selectedMediaId] : null);
                }
                break;
            }
            default: {
                console.warn(`MediaPlayerContext unknown action passed: ${params.action}`);
            }
        }
    }

    // useEffect(()=> {
    //     if (assetBucket == null) return;
    //     if (bundleId == null && playerType !== null) {
    //         return setPlayerType(null);
    //     } else {
    //         const assetById = assetBucket[bundleId as string];
    //         if (assetById.type.startsWith('V')) {
    //             return setPlayerType('VIDEO')
    //         } else if (assetById.type.startsWith('A')) {
    //             return setPlayerType('AUDIO');
    //         } else if (assetById.type.startsWith('I')) {
    //             return setPlayerType('IMAGE');
    //         } else {
    //             setPlayerType(null);
    //             console.error(`TODO cant parse for type of ${assetById.type}`);
    //         }
    //     }
    // }, [ bundleId ])

    return (
        <MediaPlayerContext.Provider value={{
            selectedMedia,
            // playerType,
            // bundleId,
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