import React from 'react';
import { ENDPOINTS } from '../../config/honk.endpoints';

import './_AssetCard.scss';
import { useMediaPlayerContext } from '../../context';
import { CoverImage } from '../cover-images/CoverImage';
import { MediaAssetBundle } from '../../types';

export const AssetCard = (assetBundle: MediaAssetBundle)=> {
    const CLASSNAME = 'asset_card';
    const {updateMediaPlayerContext} = useMediaPlayerContext();

    const setMediaPlayerContext = ()=> updateMediaPlayerContext({
        action: 'UPDATE',
        payload: { selectedMediaId: assetBundle._guid }
    });

    return (
        <div key={`AssetCard_${assetBundle._guid}`} className={CLASSNAME} onClick={setMediaPlayerContext}>
            <CoverImage assetBundle={assetBundle} />
            <h4 className={`${CLASSNAME}_title`}>{ assetBundle.title }</h4>
            { assetBundle.subTitle && <h5 className={`${CLASSNAME}_subtitle`}>{assetBundle.subTitle}</h5> }
        </div>
    )
}
