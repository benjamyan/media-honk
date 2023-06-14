import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { LibraryView, AssetLibrarySettings, MediaView } from './AssetLibraryContext.types';
import { get_bundlesByPage } from '../../api/get_bundlesByPage';
import { ENDPOINTS } from '../../config/honk.endpoints';

const AssetLibraryContext = createContext<AssetLibrarySettings>(undefined!);

const AssetLibraryContextProvider = ({ children }: {children: React.ReactNode}) => {
    const [ assetBucket, setAssetBucket ] = useState<AssetLibrarySettings['assetBucket']>(null);
    const [ libraryView, setLibraryView ] = useState<LibraryView>('ROW');
    const [ mediaView, setMediaView ] = useState<MediaView>(null);
    
    const updateLibraryContext = ()=> {

    }

    useEffect(()=> {
        get_bundlesByPage()
            .then((bundles)=> {
                if (!bundles || !Array.isArray(bundles)) {
                    throw new Error('Mishapen response');
                }
                setAssetBucket(Object.fromEntries(
                    bundles.map((bundle)=> [bundle._guid, {
                        ...bundle,
                        coverImgUrl: `${ENDPOINTS.getCoverImage}?id=${bundle._guid}`
                    }])
                ));
            })
            .catch((err)=>console.error(err));
    }, []);

    return (
        <AssetLibraryContext.Provider value={{
            assetBucket,
            libraryView,
            mediaView,
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