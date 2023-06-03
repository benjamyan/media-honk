import React, { createContext, useContext, useState } from 'react';
import { MediaLibrarySettings } from './MediaPlayerContext.types';

const MediaPlayerContext = createContext<MediaLibrarySettings>(undefined!);

const MediaPlayerContextProvider = ({ children }: {children: React.ReactNode[]}) => {
    const updateMediaPlayerContext = ()=> {

    }

    return (
        <MediaPlayerContext.Provider value={{
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
        return {}
    }
}

export {
    useMediaPlayerContext,
    MediaPlayerContextProvider
}