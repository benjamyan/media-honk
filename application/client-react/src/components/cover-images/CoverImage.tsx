import React from 'react';
import { ENDPOINTS } from '../../config/honk.endpoints';
import './_CoverImage.scss';
import { MediaAssetBundle } from '../../types';

export const CoverImage = (props: { assetBundle: MediaAssetBundle })=> {
    const { assetBundle } = props;
    const CLASSNAME = 'cover-image';

    return (
        <img 
            className={`${CLASSNAME} ${assetBundle.type[0].toLowerCase()}`} 
            src={assetBundle.coverImgUrl} 
            alt={assetBundle.title}
        />
    )
}
