import React, { MouseEventHandler } from 'react'
import { CoverImage } from '../../components/cover-images/CoverImage';
import { CloseButton } from '../../components';
import { useAssetLibraryContext, useMediaPlayerContext } from '../../context';
import { MediaAssetBundle } from '../../types';

import './_AssetOverview.scss';

const CLASSNAME = 'asset-overview';

const MediaMetaList = (props: { name: string; entries: string[] })=> {
    const { updateMediaPlayerContext } = useMediaPlayerContext();
    const { updateLibraryContext } = useAssetLibraryContext();

    const onMetaValueClickHandler: MouseEventHandler<HTMLParagraphElement> = (e)=> {
        if (!e.currentTarget.textContent) {
            console.warn('Null value received on event handler');
            console.warn(e);
            return;
        }
        updateLibraryContext({
            action: 'UPDATE',
            payload: { metaSearch: [ e.currentTarget.textContent ] }
        });
        updateMediaPlayerContext({ action: 'RESET' });
    }

    return (
        <div className={`${CLASSNAME}_meta`}>
            <p><strong>{props.name}: </strong></p>
            {props.entries.map((value)=> (
                <p className={`${CLASSNAME}_meta-value`} onClick={onMetaValueClickHandler}>{value}</p>
            ))}
        </div>
    )
}

export const AssetOverview = (props: { mediaAsset: MediaAssetBundle }) => {
    const { updateMediaPlayerContext } = useMediaPlayerContext();
    const { mediaAsset } = props;

    const closeAssetOverview = ()=> updateMediaPlayerContext({ action: 'RESET' });
    const playAssetMedia = ()=> updateMediaPlayerContext({
        action: 'UPDATE',
        payload: { mediaPlaying: true, currentMediaId: 0 }
    });
    
    return (
        <div className={ CLASSNAME }>
            <div className={`${CLASSNAME}-content`}>
                <CloseButton onClickFn={ closeAssetOverview } />
                <div onClick={ playAssetMedia }>
                    <CoverImage assetBundle={mediaAsset} />
                </div>
                <h3>{ mediaAsset.title }</h3>
                { mediaAsset.subTitle && <h4>{mediaAsset.subTitle}</h4> }
                { mediaAsset.artist && (
                    <MediaMetaList name='Artists' entries={mediaAsset.artist} />
                    // <p><strong>Artists: </strong>{mediaAsset.artist.join(', ')}</p>
                )}
                { mediaAsset.category && (
                    <MediaMetaList name='Categories' entries={mediaAsset.category} />
                    // <p><strong>Categories: </strong>{mediaAsset.category.join(', ')}</p>
                )}
            </div>
        </div>
    )
}
