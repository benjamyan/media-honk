import React, { createContext, useContext, useState } from 'react';
import { LibraryView, AssetLibrarySettings, MediaType } from './AssetLibraryContext.types';

const AssetLibraryContext = createContext<AssetLibrarySettings>(undefined!);

const AssetLibraryContextProvider = ({ children }: {children: React.ReactNode}) => {
    const [ libraryView, setLibraryView ] = useState<LibraryView>('ROW');
    const [ mediaType, setMediaType ] = useState<MediaType>(null);
    
    const updateLibraryContext = ()=> {

    }

    return (
        <AssetLibraryContext.Provider value={{
            libraryView,
            mediaType,
            updateLibraryContext
        }}>
            { children }
        </AssetLibraryContext.Provider>
    )
}

const useAssetLibraryContext = ()=> {
    try {
        const context = useContext(AssetLibraryContext);
        if (context === undefined) {
            throw new Error('An unhandled exception occured in useAssetLibraryContext');
        }
        return context
    } catch (err) {
        console.error(err)
        return {} as AssetLibrarySettings
    }
}

export {
    useAssetLibraryContext,
    AssetLibraryContextProvider
}