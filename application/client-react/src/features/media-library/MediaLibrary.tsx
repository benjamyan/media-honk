import React, { useCallback, useEffect, useState } from 'react';
import { get_bundlesByPage } from '../../api/get_bundlesByPage';
import { MEDIA_TYPES } from '../../config/copy-resolutions';
import { LoaderingIndicator } from '../../components';
import { AssetGroup } from './components/asset-group/AssetGroup';
import './_MediaLibrary.scss';

export const MediaLibrary = ()=> {
    const CLASSNAME = 'media_library';
    const [ assetBundles, setAssetBundles ] = useState<Record<string, Honk.Media.AssetBundle[]> | null>({});

    const AssetBundlesByMediaType = useCallback(
        ()=> {
            if (assetBundles === null) {
                return <LoaderingIndicator />
            } else if (Object.keys(assetBundles).length == 0) {
                return <h2>No bundles found!</h2>
            } else {
                const AssetItems: JSX.Element[] = Object.entries(assetBundles).flatMap((bundle)=> (
                    <AssetGroup rowTitle={ bundle[0] } bundleAssets={bundle[1]} />
                ));
                return <>{ AssetItems }</>
            }
        },
        [ assetBundles ]
    );

    useEffect(()=> {
        get_bundlesByPage()
            .then((bundles)=> {
                if (!bundles || !Array.isArray(bundles)) {
                    throw new Error('Mishapen response');
                }
                setAssetBundles(
                    bundles.reduce((bundleAccumulator, bundle)=> {
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
            })
            .catch((err)=>console.error(err));
    }, []);

    return (
        <div className={CLASSNAME}>
            <AssetBundlesByMediaType />
        </div>
    )
}