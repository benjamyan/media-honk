import React from 'react';
import { AssetCard } from '../../../../components/cards/AssetCard';
import { useAssetLibraryContext } from '../../../../context';

import './_AssetGroup.scss';

export const AssetGroup = (props: { rowTitle: string, bundleAssets: Honk.Media.AssetBundle[] })=> {
    const CLASSNAME = 'asset_group';
    const { libraryView } = useAssetLibraryContext();

    return (
        <section className={`${CLASSNAME}`}>
            <h2 className={`${CLASSNAME}-title`}>{ props.rowTitle }</h2>
            <div className={`${CLASSNAME}-${libraryView.toLowerCase()}  ${props.bundleAssets[0].type[0].toLowerCase()}`}>
                { props.bundleAssets.map(AssetCard)}
            </div>
        </section>
    )
}
