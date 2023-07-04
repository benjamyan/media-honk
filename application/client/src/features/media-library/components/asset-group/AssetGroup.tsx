import React from 'react';
import { AssetCard } from '../../../../components/cards/AssetCard';
import { useAssetLibraryContext } from '../../../../context';
import { MediaAssetBundle } from '../../../../types';

import './_AssetGroup.scss';
import { get_bundlesByMediaType } from '../../../../api/get_bundlesByType';

export const AssetGroup = (props: { rowTitle: string, bundleAssets: MediaAssetBundle[] })=> {
    const CLASSNAME = 'asset_group';
    const { libraryView, updateLibraryContext } = useAssetLibraryContext();

    return (
        <section className={`${CLASSNAME}`}>
            <div className={`${CLASSNAME}-title`}>
                <h2 className={`${CLASSNAME}-title_copy`}>{ props.rowTitle }</h2>
                <button 
                    className={`${CLASSNAME}-title_link`}
                    onClick={()=> {
                        get_bundlesByMediaType(props.bundleAssets[0].type)
                            .then((bundles)=> {
                                updateLibraryContext({
                                    action: 'UPDATE',
                                    payload: {
                                        mediaView: props.bundleAssets[0].type,
                                        assetBucket: bundles 
                                    }
                                })
                            })
                            .catch(()=>{})
                    }}
                >{'More >'}</button>
            </div>
            <div className={`${CLASSNAME}-${libraryView.toLowerCase()}  ${props.bundleAssets[0].type[0].toLowerCase()}`}>
                { props.bundleAssets.sort((_a, _b)=>0.5 - Math.random()).map(AssetCard)}
            </div>
        </section>
    )
}
