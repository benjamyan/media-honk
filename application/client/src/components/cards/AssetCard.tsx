import React, { useCallback } from 'react';
import { ENDPOINTS } from '../../api/_endpoints';

import './_AssetCard.scss';
import { useMediaPlayerContext } from '../../context';
import { CoverImage } from '../cover-images/CoverImage';
import { MediaAssetBundle } from '../../types';

const CLASSNAME = 'asset_card';

export type AssetCardProps = {
    assetBundle: MediaAssetBundle;
    onCardClick: ()=> void;
    onQueueButtonClick: ()=> void;
}

export const AssetCard = (props: AssetCardProps)=> {
    const { mediaQueue/*, updateMediaPlayerContext*/ } = useMediaPlayerContext();
    

    // const playSelectedMedia = ()=> updateMediaPlayerContext({
    //     action: 'UPDATE',
    //     payload: { selectedMedia: assetBundle }
    //     // payload: { selectedMediaId: assetBundle._guid }
    // });
    // const AddToMediaQueueButton = useCallback(()=>(
    //     <button className={`${CLASSNAME}_queue ${mediaQueue.includes(assetBundle._guid) ? 'remove' : ''}`} onClick={(e)=> {
    //         e.stopPropagation();
    //         updateMediaPlayerContext({action:'UPDATE', payload:{ mediaQueue: assetBundle._guid }})
    //     }}>+</button>
    // ), [ mediaQueue ])

    return (
        <div key={`AssetCard_${props.assetBundle._guid}`} className={CLASSNAME + ' lazy'} onClick={()=> props.onCardClick()}>
            {/* <AddToMediaQueueButton /> */}
            <button className={`${CLASSNAME}_queue ${mediaQueue.includes(props.assetBundle._guid) ? 'remove' : ''}`} onClick={(e)=> {
            e.stopPropagation();
            props.onQueueButtonClick();
            // updateMediaPlayerContext({action:'UPDATE', payload:{ mediaQueue: assetBundle._guid }})
        }}>+</button>
            <CoverImage assetBundle={props.assetBundle} />
            <h4 className={`${CLASSNAME}_title`}>{ props.assetBundle.title }</h4>
            { props.assetBundle.subTitle && <h5 className={`${CLASSNAME}_subtitle`}>{props.assetBundle.subTitle}</h5> }
        </div>
    )
}
