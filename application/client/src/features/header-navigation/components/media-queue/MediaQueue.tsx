import React, { useState } from 'react';

import './_MediaQueue.scss';

export const MediaQueue = () => {
    const [ queueMenuOpen, setQueueMeuOpen ] = useState(false);

    const toggleQueueMenu = ()=> setQueueMeuOpen(!queueMenuOpen)

    return (
        <>
            <button className='media__queue' onClick={ toggleQueueMenu }>Q</button>
            { queueMenuOpen &&
                <aside className='media__queue--menu'>
                    <div className='media__queue--menu-content'>
                        <button onClick={ toggleQueueMenu }>X</button>
                    </div>
                </aside>
            }
        </>
    )
}

