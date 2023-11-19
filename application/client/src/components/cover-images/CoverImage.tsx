import React, { useEffect, useRef, useState } from 'react';
import { MediaAssetBundle } from '../../types';
import { ENDPOINTS, HONK_URL, QUERY_PARAMS } from '../../api/_endpoints';

import './_CoverImage.scss';
import { get_coverImage } from '../../api/get_coverImage';

export const CoverImage = (props: { assetBundle: MediaAssetBundle })=> {
    const { assetBundle } = props;
    const imgRef = useRef<HTMLImageElement>(undefined);
    const bgRef = useRef<HTMLDivElement>(undefined);
    const [ coverImgClassName, setCoverImgClassName ] = useState(`cover-image ${assetBundle.type[0].toLowerCase()}`);

    useEffect(()=> {
        if (!imgRef.current) return;
        new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                if (!imgRef.current) return;
                if (!imgRef.current.src) {
                    imgRef.current.src = imgRef.current.dataset.src;
                    bgRef.current.style.backgroundImage = `url(${imgRef.current.dataset.src})`
                }
                observer.unobserve(imgRef.current);
            });
        }).observe(imgRef.current);
    }, []);

    return (
        <div style={{position:'relative', overflow:'hidden'}}>
            <img 
                ref={imgRef}
                className={coverImgClassName} 
                alt={assetBundle.title}
                data-src={get_coverImage(assetBundle._guid).static}
                onError={()=> {
                    setCoverImgClassName(`cover-image ${assetBundle.type[0].toLowerCase()} error`);
                }}
            />
            <div ref={bgRef} className={`cover-image_bg`}></div>
        </div>
    )
}
