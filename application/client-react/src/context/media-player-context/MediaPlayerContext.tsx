import React, { createContext, useContext, useState } from 'react';
import { MediaPlayerContextState } from './MediaPlayerContext.types';

const MediaPlayerContext = createContext<MediaPlayerContextState>(undefined!);

const MediaPlayerContextProvider = ({ children }: {children: React.ReactNode}) => {
    const [ bundleId, setBundleId ] = useState<string | null>(null);

    const updateMediaPlayerContext: MediaPlayerContextState['updateMediaPlayerContext'] = (params)=> {
        switch (params.action) {
            case 'UPDATE': {
                for (const keyname in params.payload) {
                    switch(keyname) {
                        case 'bundleId': return setBundleId(params.payload.bundleId);
                    }
                }
                break;
            }
            default: {
                console.warn(`MediaPlayerContext unknown action passed: ${params.action}`);
            }
        }
    }

    return (
        <MediaPlayerContext.Provider value={{
            bundleId,
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