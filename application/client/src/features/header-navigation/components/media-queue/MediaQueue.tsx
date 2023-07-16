import React, { useState } from 'react';

import './_MediaQueue.scss';
import { useAssetLibraryContext, useMediaPlayerContext } from '../../../../context';
import { AssetCard } from '../../../../components/cards/AssetCard';
import { toggleMediaLibraryScrollLock } from '../../../../utils/lockLibraryScroll';

export const MediaQueue = () => {
    const { assetBucket } = useAssetLibraryContext();
    const { mediaQueue } = useMediaPlayerContext();
    const [ queueMenuOpen, setQueueMeuOpen ] = useState(false);

    const toggleQueueMenu = ()=> {
        // toggleMediaLibraryScrollLock();
        setQueueMeuOpen(!queueMenuOpen);
    }

    return (
        <>
            <button className='media__queue' onClick={ toggleQueueMenu }>Q</button>
            { queueMenuOpen &&
                <aside className='media__queue--menu'>
                <button onClick={ toggleQueueMenu }>X</button>
                    <div className='media__queue--menu-content'>
                        { mediaQueue.map((queueItem)=> {
                            if (assetBucket[queueItem]) {
                                return <AssetCard { ...assetBucket[queueItem] } />
                            }
                        }) }
                    </div>
                </aside>
            }
        </>
    )
}

