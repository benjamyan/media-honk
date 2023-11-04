import React, { MouseEvent, MouseEventHandler, useCallback, useEffect } from 'react';
import { AssetCard } from '../../../../components/cards/AssetCard';
import { useAssetLibraryContext, useMediaPlayerContext } from '../../../../context';
import { MediaAssetBundle } from '../../../../types';

import './_AssetGroup.scss';
import { get_bundlesByMediaType } from '../../../../api/get_bundlesByType';

const CLASSNAME = 'asset_group';
type AssetGroupProps = {
    rowTitle: string; 
    bundleAssets: MediaAssetBundle[];
    // onViewMoreEvent: (args0: MouseEvent, args1: Honk.Media.StoredMediaTypes)=> Promise<void>;
}

// const ViewMoreButton = (props: { mediaType: Honk.Media.StoredMediaTypes })=> {
//     const { mediaView, updateLibraryContext } = useAssetLibraryContext();

//     const onViewMoreButtonClick = useCallback(()=>{
//         get_bundlesByMediaType(props.mediaType)
//             .then((bundles)=> updateLibraryContext({
//                 action: 'UPDATE',
//                 payload: {
//                     mediaView: [props.mediaType],
//                     libraryView: 'GRID',
//                     assetBucket: bundles
//                 }
//             }))
//             .catch(err=>{
//                 console.warn(err)
//             });
//     }, [ mediaView ])

//     return (
//         <button
//             className={`${CLASSNAME}-title_link`}
//             onClick={onViewMoreButtonClick}
//         >{'More >'}</button>
//     )
// }

export const AssetGroup = (props: AssetGroupProps) => {
    const { updateMediaPlayerContext } = useMediaPlayerContext();
    const { libraryView, mediaView, updateLibraryContext } = useAssetLibraryContext();

    const onAssetCardClick = (assetBundle: MediaAssetBundle)=> updateMediaPlayerContext({
        action: 'UPDATE',
        payload: { selectedMedia: assetBundle }
        // payload: { selectedMediaId: assetBundle._guid }
    });
    const onAddToQueueButtonClick = (assetBundle: MediaAssetBundle)=> {
        updateMediaPlayerContext({action:'UPDATE', payload:{ mediaQueue: assetBundle._guid }})
    }
    const onViewMoreButtonClick = useCallback(()=>{
        updateLibraryContext({
            action: 'UPDATE',
            payload: {
                mediaView: [props.bundleAssets[0].type],
                libraryView: 'GRID',
                // assetBucket: bundles
            }
        })
        // get_bundlesByMediaType(props.bundleAssets[0].type)
        //     .then((bundles)=> updateLibraryContext({
        //         action: 'UPDATE',
        //         payload: {
        //             mediaView: [props.bundleAssets[0].type],
        //             libraryView: 'GRID',
        //             assetBucket: bundles
        //         }
        //     }))
        //     .catch(err=>{
        //         console.warn(err)
        //     });
    }, [ mediaView ]);
    
    if (!props.bundleAssets[0] || !props.bundleAssets[0].type) {
        return null
    }
    return (
        <section className={`${CLASSNAME}`}>
            <div className={`${CLASSNAME}-title`}>
                { mediaView.length !== 1 &&
                    <h2 className={`${CLASSNAME}-title_copy`}>{props.rowTitle}</h2>
                }
                { (mediaView.length == 0 && !!props.bundleAssets[0] && !!props.bundleAssets[0].type) &&        
                    <button
                        className={`${CLASSNAME}-title_link`}
                        onClick={onViewMoreButtonClick}
                    >{'More >'}</button>
                    // <ViewMoreButton mediaType={props.bundleAssets[0].type} />
                }
            </div>
            <div className={`${CLASSNAME}-${libraryView.toLowerCase()}  ${props.bundleAssets[0].type[0].toLowerCase()}`}>
                { props.bundleAssets.map((bundle)=> (
                    <AssetCard 
                        assetBundle={bundle} 
                        onCardClick={()=>onAssetCardClick(bundle)} 
                        onQueueButtonClick={()=>onAddToQueueButtonClick(bundle)} 
                    />
                )) }
            </div>
        </section>
    )
}
