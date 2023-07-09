import React, { useCallback, useEffect, useState } from 'react';
import { MEDIA_TYPES } from '../../config/copy-resolutions';
import { LoaderingIndicator } from '../../components';
import { AssetGroup } from './components/asset-group/AssetGroup';
import { useAssetLibraryContext, useMediaPlayerContext } from '../../context';
import { MediaAssetBundle } from '../../types';
import { MEDIA_LIBRARY_ATTRS } from '../../config/dom-attributes';
import { toggleMediaLibraryScrollLock } from '../../utils/lockLibraryScroll';

import './_MediaLibrary.scss';

let isMediaSelected: boolean = false;

export const MediaLibrary = ()=> {
    const CLASSNAME = 'media_library';
    const { selectedMedia } = useMediaPlayerContext();
    const { assetBucket, mediaView, libraryView, metaSearch } = useAssetLibraryContext();
    const [ sortedAssetBundles, setSortedAssetBundles ] = useState<Record<string, MediaAssetBundle[]> | null>({});

    const AssetBundlesByMediaType = useCallback(
        ()=> {
            if (sortedAssetBundles === null) {
                return <LoaderingIndicator />
            } else if (Object.keys(sortedAssetBundles).length == 0) {
                return <h2>No bundles found!</h2>
            }
            
            const AssetItems: JSX.Element[] = Object.entries(sortedAssetBundles).flatMap((bundle, i)=> {
                if (mediaView.length > 0 && !mediaView.includes(bundle[1][0].type)) return <></>;
                if (bundle[1].length == 0) return <></>
                return (
                    <AssetGroup key={`AssetGroup-${i}`} rowTitle={ bundle[0] } bundleAssets={bundle[1]} />
                )
            });
            return <>{ AssetItems }</>
        },
        [ sortedAssetBundles, mediaView ]
    );

    useEffect(()=> {
        /** Sorting based on the asset bundles given via context */
        setSortedAssetBundles(
            Object.values(assetBucket).reduce((bundleAccumulator, bundle)=> {
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
                            if ([...bundle.artist, ...bundle.category].includes(meta)) {
                                assetRow.push(bundle);
                            }
                        }
                    } else {
                        assetRow.push(bundle);
                    }
                } else {
                    console.log(`Cant find in MEDIA_TYPES: ${bundle.type}`);
                }
                return bundleAccumulator
            }, {} as Record<string, MediaAssetBundle[]>) 
        );
    }, [ assetBucket, mediaView, libraryView, metaSearch ]);

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

    return (
        <div {...MEDIA_LIBRARY_ATTRS} className={`${CLASSNAME} ${selectedMedia !== null ? 'locked' : ''}`}>
            <AssetBundlesByMediaType />
        </div>
    )
}