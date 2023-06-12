import React from 'react';
import { ENDPOINTS } from '../../config/honk.endpoints';
import './_CoverImage.scss';

export const CoverImage = (props: { assetBundle: Honk.Media.AssetBundle })=> {
    const { assetBundle } = props;
    const CLASSNAME = 'cover-image';

    return (
        <img 
            className={`${CLASSNAME} ${assetBundle.type[0].toLowerCase()}`} 
            src={`${ENDPOINTS.local.getCoverImage}?id=${assetBundle._guid}`} 
            alt={assetBundle.title}
        />
    )
}
