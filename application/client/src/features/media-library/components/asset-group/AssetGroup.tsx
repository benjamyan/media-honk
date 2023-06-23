import React from 'react';
import { AssetCard } from '../../../../components/cards/AssetCard';
import { useAssetLibraryContext } from '../../../../context';
import { MediaAssetBundle } from '../../../../types';

import './_AssetGroup.scss';

export const AssetGroup = (props: { rowTitle: string, bundleAssets: MediaAssetBundle[] })=> {
    const CLASSNAME = 'asset_group';
    const { libraryView } = useAssetLibraryContext();

    return (
        <section className={`${CLASSNAME}`}>
            <div className={`${CLASSNAME}-title`}>
                <h2 className={`${CLASSNAME}-title_copy`}>{ props.rowTitle }</h2>
                <button className={`${CLASSNAME}-title_link`}>{'More >'}</button>
            </div>
            <div className={`${CLASSNAME}-${libraryView.toLowerCase()}  ${props.bundleAssets[0].type[0].toLowerCase()}`}>
                { props.bundleAssets.sort((a, b)=>0.5 - Math.random()).map(AssetCard)}
            </div>
        </section>
    )
}
