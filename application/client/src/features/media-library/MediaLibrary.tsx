import React, { useEffect, useMemo, MouseEvent } from 'react';
import { MEDIA_TYPES } from '../../config/copy-resolutions';
import { LoaderingIndicator } from '../../components';
import { AssetGroup } from './components/asset-group/AssetGroup';
import { useAssetLibraryContext, useMediaPlayerContext } from '../../context';
import { MediaAssetBundle } from '../../types';
import { MEDIA_LIBRARY_ATTRS } from '../../config/dom-attributes';
import { toggleMediaLibraryScrollLock } from '../../utils/lockLibraryScroll';

import './_MediaLibrary.scss';
import { MediaView } from '../../context/asset-library-context/AssetLibraryContext.types';
import { get_bundlesByMediaType } from '../../api/get_bundlesByType';

let isMediaSelected: boolean = false;

const AssetBundlesByMediaType = ()=> {
    const { assetBucket, mediaView, libraryView, metaSearch } = useAssetLibraryContext();

    // const onViewMoreButtonClick = async (_event: MouseEvent, mediaType: Honk.Media.StoredMediaTypes)=> {
    //     try {
    //         // const bundles = await get_bundlesByMediaType(mediaType);
    //         updateLibraryContext({
    //             action: 'UPDATE',
    //             payload: {
    //                 mediaView: [mediaType],
    //                 // libraryView: 'GRID',
    //                 // assetBucket: bundles
    //             }
    //         });
    //     } catch (err) {
    //         console.warn(err);
    //     }
    // }
    
    const sortedAssets = useMemo(()=>{
        return Object.values(assetBucket).reduce((bundleAccumulator, bundle)=> {
            if (!bundle || !bundle.type) return bundleAccumulator;
            const assetRowTitle = Object.keys(MEDIA_TYPES).find((title)=> bundle.type.startsWith(title));
            let assetRow = bundleAccumulator[MEDIA_TYPES[assetRowTitle as Honk.Media.StoredMediaTypes]];
            
            processAssetBundle:
            if (assetRowTitle) {
                if (!assetRow) {
                    bundleAccumulator[MEDIA_TYPES[assetRowTitle as Honk.Media.StoredMediaTypes]] = [];
                    assetRow = bundleAccumulator[MEDIA_TYPES[assetRowTitle as Honk.Media.StoredMediaTypes]];
                }
                if (libraryView === 'ROW' && assetRow.length >= 10) {
                    break processAssetBundle;
                }
                if (metaSearch.length > 0) {
                    for (const meta of metaSearch) {
                        if (![...bundle.artist, ...bundle.category].includes(meta)) break;
                        if (!mediaView.includes(bundle.type)) break;
                        assetRow.push(bundle);
                    }
                    assetRow.filter(({artist, category })=> {
                        metaSearch.every((meta)=>[...artist, ...category].includes(meta))
                    })
                } else if (mediaView.length > 0 && mediaView.includes(bundle.type)) {
                    assetRow.push(bundle);
                } else if (mediaView.length == 0 && metaSearch.length == 0) {
                    assetRow.push(bundle);
                }
            } else {
                console.log(`Cant find in MEDIA_TYPES: ${bundle.type}`);
            }
            return bundleAccumulator
        }, {} as Record<string, MediaAssetBundle[]>);
    }, [ assetBucket, mediaView, metaSearch, libraryView ]);
    console.log(sortedAssets)
    if (assetBucket === null) {
        return <LoaderingIndicator />
    } else if (Object.keys(sortedAssets).length == 0) {
        return <h2>No bundles found!</h2>
    }
    return Object.entries(sortedAssets).flatMap((bundle, i)=> {

        return (
            <AssetGroup 
                key={`AssetGroup-${Date.parse(new Date().toUTCString())}-${i}`} 
                rowTitle={ bundle[0] } 
                bundleAssets={ bundle[1].sort((_a, _b) => 0.5 - Math.random())} 
                // onViewMoreEvent={onViewMoreButtonClick}
            />
        )
    });
};

const ContextMutationHandler = ()=> {
    const { selectedMedia } = useMediaPlayerContext();
    
    useEffect(()=>{
        if (selectedMedia !== null) {
            if (isMediaSelected) return; 
            isMediaSelected = true;
            toggleMediaLibraryScrollLock();
        } else {
            if (!isMediaSelected) return; 
            isMediaSelected = false;
            toggleMediaLibraryScrollLock();
        }
    }, [ selectedMedia ]);

    return null
};

export const MediaLibrary = ()=> {
    
    return (
        <div {...MEDIA_LIBRARY_ATTRS} className='media_library'>
            <ContextMutationHandler />
            <AssetBundlesByMediaType />
        </div>
    )
}