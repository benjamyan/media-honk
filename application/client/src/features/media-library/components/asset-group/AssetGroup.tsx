import React, { MouseEvent, MouseEventHandler } from 'react';
import { AssetCard } from '../../../../components/cards/AssetCard';
import { useAssetLibraryContext } from '../../../../context';
import { MediaAssetBundle } from '../../../../types';

import './_AssetGroup.scss';
import { get_bundlesByMediaType } from '../../../../api/get_bundlesByType';

const CLASSNAME = 'asset_group';
type AssetGroupProps = {
    rowTitle: string; 
    bundleAssets: MediaAssetBundle[];
    onViewMoreEvent: (args0: MouseEvent, args1: Honk.Media.StoredMediaTypes)=> Promise<void>;
}

export const AssetGroup = (props: AssetGroupProps) => {
    const { libraryView, mediaView, updateLibraryContext } = useAssetLibraryContext();

    const onViewMoreButtonClick: MouseEventHandler<HTMLButtonElement> = async ()=> {
        try {
            const bundles = await get_bundlesByMediaType(props.bundleAssets[0].type);
            updateLibraryContext({
                action: 'UPDATE',
                payload: {
                    mediaView: [props.bundleAssets[0].type],
                    libraryView: 'GRID',
                    assetBucket: bundles
                }
            });
        } catch (err) {
            console.warn(err);
        }
    }

    return (
        <section className={`${CLASSNAME}`}>
            <div className={`${CLASSNAME}-title`}>
                { mediaView.length !== 1 &&
                    <h2 className={`${CLASSNAME}-title_copy`}>{props.rowTitle}</h2>
                }
                { mediaView.length == 0 &&
                    <button
                        className={`${CLASSNAME}-title_link`}
                        onClick={onViewMoreButtonClick}
                    >{'More >'}</button>
                    // <button className={`${CLASSNAME}-title_link`} onClick={(e)=> props.onViewMoreEvent(e, props.bundleAssets[0].type)}>{'More >'}</button>

                }
            </div>
            <div className={`${CLASSNAME}-${libraryView.toLowerCase()}  ${props.bundleAssets[0].type[0].toLowerCase()}`}>
                {props.bundleAssets.map(AssetCard)}

                {/* {props.bundleAssets.sort((_a, _b) => 0.5 - Math.random()).map(AssetCard)} */}
            </div>
        </section>
    )
}
