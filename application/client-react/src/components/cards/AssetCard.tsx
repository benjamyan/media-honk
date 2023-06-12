import React from 'react';
import { ENDPOINTS } from '../../config/honk.endpoints';

import './_AssetCard.scss';
import { useMediaPlayerContext } from '../../context';
import { CoverImage } from '../cover-images/CoverImage';

export const AssetCard = (assetBundle: Honk.Media.AssetBundle)=> {
    const CLASSNAME = 'asset_card';
    const {updateMediaPlayerContext} = useMediaPlayerContext();

    const setMediaPlayerContext = ()=> updateMediaPlayerContext({
        action: 'UPDATE',
        payload: {
            bundleId: assetBundle._guid
        }
    });

    return (
        <div key={`AssetCard_${assetBundle._guid}`} className={CLASSNAME} onClick={setMediaPlayerContext}>
            <CoverImage assetBundle={assetBundle} />
            {/* <img 
                className={`${CLASSNAME}-cover ${assetBundle.type[0].toLowerCase()}`} 
                src={`${ENDPOINTS.local.getCoverImage}?id=${assetBundle._guid}`} 
                alt={assetBundle.title}
            /> */}
            <h5>{ assetBundle.title }</h5>
            { assetBundle.subTitle && <h6>{assetBundle.subTitle}</h6> }
        </div>
    )
}
