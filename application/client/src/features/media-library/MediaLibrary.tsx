import React, { useCallback, useEffect, useState } from 'react';
import { get_bundlesByPage } from '../../api/get_bundlesByPage';
import { MEDIA_TYPES } from '../../config/copy-resolutions';
import { LoaderingIndicator } from '../../components';
import { AssetGroup } from './components/asset-group/AssetGroup';
import './_MediaLibrary.scss';
import { useAssetLibraryContext, useMediaPlayerContext } from '../../context';
import { MediaAssetBundle } from '../../types';

export const MediaLibrary = ()=> {
    const CLASSNAME = 'media_library';
    const { selectedMedia } = useMediaPlayerContext();
    const { assetBucket } = useAssetLibraryContext();
    const [ sortedAssetBundles, setSortedAssetBundles ] = useState<Record<string, MediaAssetBundle[]> | null>({});

    const AssetBundlesByMediaType = useCallback(
        ()=> {
            if (sortedAssetBundles === null) {
                return <LoaderingIndicator />
            } else if (Object.keys(sortedAssetBundles).length == 0) {
                return <h2>No bundles found!</h2>
            }
            const AssetItems: JSX.Element[] = Object.entries(sortedAssetBundles).flatMap((bundle, i)=> (
                <AssetGroup key={`AssetGroup-${i}`} rowTitle={ bundle[0] } bundleAssets={bundle[1]} />
            ));
            return <>{ AssetItems }</>
        },
        [ sortedAssetBundles ]
    );

    useEffect(()=> {
        /** Sorting based on the asset bundles given via context */
        if (!assetBucket) return;
        setSortedAssetBundles(
            Object.values(assetBucket).reduce((bundleAccumulator, bundle)=> {
                const assetRowTitle = (
                    Object.keys(MEDIA_TYPES).find((title)=> bundle.type.startsWith(title))
                );
                
                if (assetRowTitle) {
                    if (!bundleAccumulator[MEDIA_TYPES[assetRowTitle]]) {
                        bundleAccumulator[MEDIA_TYPES[assetRowTitle]] = [];
                    }
                    bundleAccumulator[MEDIA_TYPES[assetRowTitle]].push(bundle);
                } else {
                    console.log(`Cant find in MEDIA_TYPES: ${bundle.type}`);
                }
                return bundleAccumulator
            }, {} as Record<string, MediaAssetBundle[]>) 
        );
    }, [assetBucket]);

    return (
        <div className={`${CLASSNAME} ${selectedMedia !== null ? 'locked' : ''}`}>
            <AssetBundlesByMediaType />
        </div>
    )
}