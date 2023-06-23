import React from 'react'
import { CoverImage } from '../../components/cover-images/CoverImage';
import { CloseButton } from '../../components';
import { useMediaPlayerContext } from '../../context';
import { MediaAssetBundle } from '../../types';

import './_AssetOverview.scss';

export const AssetOverview = (props: { mediaAsset: MediaAssetBundle }) => {
    const { updateMediaPlayerContext } = useMediaPlayerContext();
    const CLASSNAME = 'asset-overview';
    const { mediaAsset } = props;

    const closeAssetOverview = ()=> updateMediaPlayerContext({
        action: 'UPDATE',
        payload: { selectedMediaId: null }
    });
    const playAssetMedia = ()=> updateMediaPlayerContext({
        action: 'UPDATE',
        payload: { mediaPlaying: true, currentMediaId: 0 }
    });

    return (
        <div className={ CLASSNAME }>
            <CloseButton onClickFn={ closeAssetOverview } />
            <div onClick={ playAssetMedia }>
                <CoverImage assetBundle={mediaAsset} />
            </div>
            <h3>{ mediaAsset.title }</h3>
            { mediaAsset.subTitle && <h4>{mediaAsset.subTitle}</h4> }
            { mediaAsset.artist && (
                <p><strong>Artists: </strong>{mediaAsset.artist.join(', ')}</p>
            )}
            { mediaAsset.category && (
                <p><strong>Categories: </strong>{mediaAsset.category.join(', ')}</p>
            )}
        </div>
    )
}
