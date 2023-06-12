import React, { createContext, useContext, useEffect, useState } from 'react';
import { MediaPlayerContextState, MediaPlayerType } from './MediaPlayerContext.types';
import { useAssetLibraryContext } from '../asset-library-context/AssetLibraryContext';

const MediaPlayerContext = createContext<MediaPlayerContextState>(undefined!);

const MediaPlayerContextProvider = ({ children }: {children: React.ReactNode}) => {
    const { assetBucket } = useAssetLibraryContext();
    const [ mediaPlaying, setMediaPlaying ] = useState<boolean>(false);
    const [ mediaType, setMediaType ] = useState<MediaPlayerContextState['mediaType']>(null);
    const [ bundleId, setBundleId ] = useState<MediaPlayerContextState['bundleId']>(null);

    const updateMediaPlayerContext: MediaPlayerContextState['updateMediaPlayerContext'] = (params)=> {
        switch (params.action) {
            case 'UPDATE': {
                if (params.payload.bundleId !== undefined) {
                    setBundleId(params.payload.bundleId);
                }
                break;
            }
            default: {
                console.warn(`MediaPlayerContext unknown action passed: ${params.action}`);
            }
        }
    }

    useEffect(()=> {
        if (assetBucket == null) return;
        if (bundleId == null && mediaType !== null) {
            return setMediaType(null);
        } else {
            const assetById = assetBucket[bundleId as string];
            if (assetById.type.startsWith('V')) {
                return setMediaType('VIDEO')
            } else if (assetById.type.startsWith('A')) {
                return setMediaType('AUDIO');
            } else if (assetById.type.startsWith('I')) {
                return setMediaType('IMAGE');
            } else {
                setMediaType(null);
                console.error(`TODO cant parse for type of ${assetById.type}`);
            }
        }
    }, [ bundleId ])

    return (
        <MediaPlayerContext.Provider value={{
            mediaType,
            bundleId,
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