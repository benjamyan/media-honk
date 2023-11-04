import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { LibraryView, AssetLibrarySettings, MediaView } from './AssetLibraryContext.types';
import { get_bundlesByPage } from '../../api/get_bundlesByPage';
import { ENDPOINTS } from '../../api/_endpoints';
import { get_metaValues } from '../../api/get_metaValues';
import { get_assetBundles } from '../../api/get_assetBundles';
import { get_bundlesByMediaType } from '../../api/get_bundlesByType';

const AssetLibraryContext = createContext<AssetLibrarySettings>(undefined!);

const AssetLibraryContextProvider = ({ children }: {children: React.ReactNode}) => {
    const [ assetBucket, setAssetBucket ] = useState<AssetLibrarySettings['assetBucket']>({});
    const [ metaArtistBucket, setMetaArtistBucket ] = useState<AssetLibrarySettings['metaArtistBucket']>([]);
    const [ metaCategoryBucket, setMetaCategoryBucket ] = useState<AssetLibrarySettings['metaCategoryBucket']>([]);
    const [ metaSearch, setMetaSearch ] = useState<string[]>([]);
    const [ libraryView, setLibraryView ] = useState<LibraryView>('ROW');
    const [ mediaView, setMediaView ] = useState<MediaView>([]);
    
    const updateLibraryContext: AssetLibrarySettings['updateLibraryContext'] = (params)=> {
        switch (params.action) {
            case 'RESET': {
                setMediaView([]);
                setLibraryView('ROW');
                if (metaSearch.length > 0) setMetaSearch([]);
                break;
            }
            default:
            case 'UPDATE': {
                const { payload } = params;
                if (payload.assetBucket !== undefined) {
                    console.log(payload.assetBucket);
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
                if (payload.mediaView !== undefined) {
                    if (payload.mediaView === 'NULL') {
                        setMediaView([])
                        if (libraryView == 'GRID' && metaSearch.length == 0) setLibraryView('ROW');
                    } else {
                        setMediaView([ ...payload.mediaView ] as MediaView);
                        if (libraryView == 'ROW') setLibraryView('GRID');
                    }
                }
                if (payload.libraryView !== undefined) {
                    setLibraryView(payload.libraryView);
                }
                if (payload.metaSearch !== undefined) {
                    if (typeof(payload.metaSearch) == 'string') {
                        if (metaSearch.includes(payload.metaSearch)) {
                            metaSearch.splice(metaSearch.findIndex((searchValue)=> searchValue == payload.metaSearch), 1);
                            setMetaSearch([...metaSearch]);
                        } else {
                            setMetaSearch([...metaSearch, payload.metaSearch]);
                        }
                    } else if (payload.metaSearch.length > 0) {
                        setMetaSearch([...payload.metaSearch] as string[]);
                    } else {
                        setMetaSearch([] as string[]);
                    }
                }
            }
        }
    }

    useEffect(()=> {
        get_bundlesByPage()
            .then((bundles)=> {
                // if (!bundles || !Array.isArray(bundles)) {
                //     throw new Error('Mishapen response');
                // }
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
    
    // useEffect(()=>{
    //     if (metaSearch.length == 0) {
    //         updateLibraryContext({ action: 'RESET' })
    //         return;
    //     }
    //     const bundleRequest: Partial<Record<'artist' | 'category', string[]>> = {};
    //     for (const metaValue of metaSearch) {
    //         if (metaArtistBucket.includes(metaValue)) {
    //             if (bundleRequest.artist == undefined) {
    //                 bundleRequest.artist = [];
    //             }
    //             bundleRequest.artist.push(metaValue);
    //         } else if (metaCategoryBucket.includes(metaValue)) {
    //             if (bundleRequest.category == undefined) {
    //                 bundleRequest.category = [];
    //             }
    //             bundleRequest.category.push(metaValue);
    //         }
    //     }
    //     if (bundleRequest.category && bundleRequest.artist) {
    //         console.warn('TODO cant accept multi param');
    //         return;
    //     }
    //     get_assetBundles(bundleRequest).axios().then((res)=>{
    //         updateLibraryContext({
    //             action: 'UPDATE',
    //             payload: { 
    //                 assetBucket: res,
    //                 libraryView: (metaSearch.length > 0 && libraryView == 'ROW') ? 'GRID' : undefined
    //             }
    //         })
    //         // if (metaSearch.length > 0 && libraryView == 'ROW') setLibraryView('GRID');
    //     })
    // }, [metaSearch])

    // useEffect(()=>{
    //     // if (mediaView.length == 0) {
    //     //     return;
    //     // }
    //     get_bundlesByMediaType(mediaView[0])
    //         .then((bundles)=> {
    //             updateLibraryContext({
    //                 action: 'UPDATE',
    //                 payload: {
    //                     // libraryView: bundles.length > 0 ? 'GRID' : undefined,
    //                     assetBucket: bundles
    //                 }
    //             })
    //         })
    //         // .catch(err=>{
    //         //     console.warn(err)
    //         // });
    // }, [ mediaView ])

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