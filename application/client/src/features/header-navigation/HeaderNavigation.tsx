import React from 'react';

import { MetaSearchBar } from './components/meta-search/MetaSearchBar';
import { MediaQueue } from './components/media-queue/MediaQueue';

import './_HeaderNavigation.scss';

export const HeaderNavigation = ()=> {

    return (
        <nav className='header__nav'>
            <MetaSearchBar />
            <MediaQueue />
        </nav>
    )
}
