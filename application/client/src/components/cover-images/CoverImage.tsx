import React, { useEffect, useRef, useState } from 'react';
import { MediaAssetBundle } from '../../types';
import { ENDPOINTS, HONK_URL, QUERY_PARAMS } from '../../api/_endpoints';

import './_CoverImage.scss';
import { get_coverImage } from '../../api/get_coverImage';

function elementInViewport2(el) {
    if (!el) return;
    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;
  
    while(el.offsetParent) {
      el = el.offsetParent;
      top += el.offsetTop;
      left += el.offsetLeft;
    }
  
    return (
      top < (window.pageYOffset + window.innerHeight) &&
      left < (window.pageXOffset + window.innerWidth) &&
      (top + height) > window.pageYOffset &&
      (left + width) > window.pageXOffset
    );
}

export const CoverImage = (props: { assetBundle: MediaAssetBundle })=> {
    const { assetBundle } = props;
    const imgRef = useRef<HTMLImageElement>(undefined);
    const [ coverImgClassName, setCoverImgClassName ] = useState(`cover-image ${assetBundle.type[0].toLowerCase()}`);

    useEffect(()=> {
        if (!imgRef.current) return;
        new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                if (!imgRef.current) return;
                if (!imgRef.current.src) {
                    imgRef.current.src = imgRef.current.dataset.src;
                }
                observer.unobserve(imgRef.current);
            });
        }).observe(imgRef.current);
    }, []);

    return (
        <img 
            ref={imgRef}
            className={coverImgClassName} 
            alt={assetBundle.title}
            data-src={get_coverImage(assetBundle._guid).static}
            onError={()=> {
                setCoverImgClassName(`cover-image ${assetBundle.type[0].toLowerCase()} error`);
                // coverImgClassName = coverImgClassName + ' error'
            }}
        />
    )
}
