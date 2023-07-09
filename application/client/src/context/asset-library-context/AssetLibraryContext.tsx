import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { LibraryView, AssetLibrarySettings, MediaView } from './AssetLibraryContext.types';
import { get_bundlesByPage } from '../../api/get_bundlesByPage';
import { ENDPOINTS } from '../../api/_endpoints';
import { get_metaValues } from '../../api/get_metaValues';
import { get_assetBundles } from '../../api/get_assetBundles';

const AssetLibraryContext = createContext<AssetLibrarySettings>(undefined!);

const AssetLibraryContextProvider = ({ children }: {children: React.ReactNode}) => {
    const [ assetBucket, setAssetBucket ] = useState<AssetLibrarySettings['assetBucket']>({});
    const [ metaArtistBucket, setMetaArtistBucket ] = useState<AssetLibrarySettings['metaArtistBucket']>([]);
    const [ metaCategoryBucket, setMetaCategoryBucket ] = useState<AssetLibrarySettings['metaCategoryBucket']>([]);
    const [ metaSearch, setMetaSearch ] = useState<string[]>([]);
    const [ libraryView, setLibraryView ] = useState<LibraryView>('ROW');
    const [ mediaView, setMediaView ] = useState<MediaView>([]);
    
    const updateLibraryContext: AssetLibrarySettings['updateLibraryContext'] = ({ action, payload })=> {
        switch (action) {
            default:
            case 'UPDATE': {
                if (payload.assetBucket) {
                    setAssetBucket({
                        ...assetBucket,
                        ...Object.fromEntries(
                            payload.assetBucket.map((bundle)=> [bundle._guid, {
                                ...bundle,
                                coverImgUrl: `${ENDPOINTS.getCoverImage}?id=${bundle._guid}`
                            }])
                        )
                    });
                }
                if (payload.mediaView) {
                    if (payload.mediaView === 'NULL') {
                        setMediaView([])
                    } else {
                        setMediaView([ ...payload.mediaView ] as MediaView);
                    }
                }
                if (payload.libraryView) {
                    setLibraryView(payload.libraryView);
                }
                if (payload.metaSearch) {
                    get_assetBundles({
                        artist: metaArtistBucket.map((artist)=>payload.metaSearch?.includes(artist) ? artist : undefined).filter(Boolean) as string[],
                        category: metaCategoryBucket.map((category)=>payload.metaSearch?.includes(category) ? category : undefined).filter(Boolean) as string[]
                    }).axios().then((res)=>{
                        updateLibraryContext({
                            action: 'UPDATE',
                            payload: { assetBucket: res }
                        })
                        setMetaSearch(payload.metaSearch as string[]);
                        /// @ts-expect-error
                        if (payload.metaSearch.length > 0 && libraryView == 'ROW') setLibraryView('GRID');
                    })
                }
            }
        }
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
        get_metaValues()
            .then((meta)=> {
                setMetaArtistBucket([...meta.artist_name]);
                setMetaCategoryBucket([...meta.category_name]);
            })
            .catch((err)=>console.error(err));
    }, []);

    return (
        <AssetLibraryContext.Provider value={{
            assetBucket,
            metaArtistBucket,
            metaCategoryBucket,
            libraryView,
            mediaView,
            metaSearch,
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