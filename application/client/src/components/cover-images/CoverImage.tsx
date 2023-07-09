import React from 'react';
import { MediaAssetBundle } from '../../types';
import { ENDPOINTS, HONK_URL, QUERY_PARAMS } from '../../api/_endpoints';

import './_CoverImage.scss';
import { get_coverImage } from '../../api/get_coverImage';

export const CoverImage = (props: { assetBundle: MediaAssetBundle })=> {
    const { assetBundle } = props;
    const CLASSNAME = 'cover-image';
    
    return (
        <img 
            className={`${CLASSNAME} ${assetBundle.type[0].toLowerCase()}`} 
            src={get_coverImage(assetBundle._guid).static}
            alt={assetBundle.title}
        />
    )
}
