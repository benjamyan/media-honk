import React, { useCallback, useEffect, useState } from 'react';
import { get_bundlesByPage } from '../../api/get_bundlesByPage';
import { MEDIA_TYPES } from '../../config/copy-resolutions';
import { LoaderingIndicator } from '../../components';
import { AssetGroup } from './components/asset-group/AssetGroup';
import './_MediaLibrary.scss';
import { useAssetLibraryContext, useMediaPlayerContext } from '../../context';

export const MediaLibrary = ()=> {
    const CLASSNAME = 'media_library';
    const { bundleId } = useMediaPlayerContext();
    const { assetBucket } = useAssetLibraryContext();
    const [ assetBundles, setAssetBundles ] = useState<Record<string, Honk.Media.AssetBundle[]> | null>({});

    const AssetBundlesByMediaType = useCallback(
        ()=> {
            if (assetBundles === null) {
                return <LoaderingIndicator />
            } else if (Object.keys(assetBundles).length == 0) {
                return <h2>No bundles found!</h2>
            }
            const AssetItems: JSX.Element[] = Object.entries(assetBundles).flatMap((bundle, i)=> (
                <AssetGroup key={`AssetGroup-${i}`} rowTitle={ bundle[0] } bundleAssets={bundle[1]} />
            ));
            return <>{ AssetItems }</>
        },
        [ assetBundles ]
    );

    useEffect(()=> {
        if (!assetBucket) return;
        setAssetBundles(
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
            }, {} as Record<string, Honk.Media.AssetBundle[]>) 
        );
    }, [assetBucket]);

    return (
        <div className={`${CLASSNAME} ${bundleId !== null ? 'locked' : ''}`}>
            <AssetBundlesByMediaType />
        </div>
    )
}