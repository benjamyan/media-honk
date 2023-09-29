import React, { useEffect, useState } from 'react';
import { MediaAssetBundle } from '../../types';
import { ENDPOINTS, HONK_URL, QUERY_PARAMS } from '../../api/_endpoints';

import './_CoverImage.scss';
import { get_coverImage } from '../../api/get_coverImage';

export const CoverImage = (props: { assetBundle: MediaAssetBundle })=> {
    const { assetBundle } = props;
    const [ coverImgClassName, setCoverImgClassName ] = useState(`cover-image ${assetBundle.type[0].toLowerCase()}`);

    return (
        <img 
            className={coverImgClassName} 
            src={get_coverImage(assetBundle._guid).static}
            alt={assetBundle.title}
            decoding='async'
            loading='lazy'
            onError={()=> {
                setCoverImgClassName(`cover-image ${assetBundle.type[0].toLowerCase()} error`);
                // coverImgClassName = coverImgClassName + ' error'
            }}
        />
    )
}
