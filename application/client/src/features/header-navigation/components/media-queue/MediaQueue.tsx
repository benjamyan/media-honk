import React, { useState } from 'react';

import './_MediaQueue.scss';
import { useAssetLibraryContext, useMediaPlayerContext } from '../../../../context';
import { AssetCard } from '../../../../components/cards/AssetCard';
import { toggleMediaLibraryScrollLock } from '../../../../utils/lockLibraryScroll';
import { MediaAssetBundle } from '../../../../types';

export const MediaQueue = () => {
    const { assetBucket } = useAssetLibraryContext();
    const { mediaQueue, updateMediaPlayerContext } = useMediaPlayerContext();
    const [ queueMenuOpen, setQueueMeuOpen ] = useState(false);
    
    const onAssetCardClick = (assetBundle: MediaAssetBundle)=> updateMediaPlayerContext({
        action: 'UPDATE',
        payload: { selectedMedia: assetBundle }
        // payload: { selectedMediaId: assetBundle._guid }
    });
    const onAddToQueueButtonClick = (assetBundle: MediaAssetBundle)=> {
        updateMediaPlayerContext({action:'UPDATE', payload:{ mediaQueue: assetBundle._guid }})
    }
    const toggleQueueMenu = ()=> {
        toggleMediaLibraryScrollLock();
        setQueueMeuOpen(!queueMenuOpen);
    };
    const clearMediaQueue = ()=> {
        updateMediaPlayerContext({
            action: 'UPDATE',
            payload: {
                mediaQueue: null
            }
        });
        toggleQueueMenu();
    };

    return (
        <>
            <button className='media__queue' onClick={ toggleQueueMenu }>Q</button>
            { queueMenuOpen &&
                <aside className='media__queue--menu'>
                    <nav className='media__queue--nav'>
                        <button className='media__queue--nav-clear' onClick={clearMediaQueue}>CLEAR</button>
                        <button className='media__queue--nav-close' onClick={ toggleQueueMenu }>X</button>
                    </nav>
                    <div className='media__queue--menu-content'>
                        <div className='media__queue--menu-scroll'></div>
                        { mediaQueue.map((queueItem, i)=> {
                            if (assetBucket[queueItem]) {
                                return (
                                    <AssetCard 
                                        key={`assetcardqueueitem-${i}`}
                                        assetBundle={assetBucket[queueItem]} 
                                        onCardClick={()=> onAssetCardClick(assetBucket[queueItem])}
                                        onQueueButtonClick={()=> onAddToQueueButtonClick(assetBucket[queueItem])}
                                    />
                                )
                            }
                        }) }
                    </div>
                </aside>
            }
        </>
    )
}

