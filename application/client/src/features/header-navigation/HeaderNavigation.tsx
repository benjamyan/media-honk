import React, { useReducer } from 'react';

import { MetaSearchBar } from './components/meta-search/MetaSearchBar';
import { MediaQueue } from './components/media-queue/MediaQueue';

import './_HeaderNavigation.scss';

export const HeaderNavigation = ()=> {
    const [ activeSearchEntries, updateActiveSearchEntries ] = useReducer(
        (state: string[], { action, value }: { action: 'ADD' | 'REMOVE', value: string | null })=> {
            let _state = [...state];
            if (typeof(value) !== 'string') return _state;
            if (action == 'ADD') {
                if (_state.includes(value)) {
                    console.warn(`State "activeSearchEntries" already contains: ${value}`);
                    return _state
                }
                _state.push(value);
            } else if (action == 'REMOVE') {
                if (!_state.includes(value)) {
                    console.warn(`State "activeSearchEntries" does not contain: ${value}`);
                    return _state
                }
                _state.splice(_state.findIndex((searchValue)=> searchValue == value), 1);
            }
            return _state
        },
        []
    );
    
    return (
        <nav className='header__nav'>
            <div className='header__nav--interact'>
                <MetaSearchBar updateSearchValue={updateActiveSearchEntries} />
                <MediaQueue />
            </div>
            <div className='header__nav--searching'>
                { activeSearchEntries.map((metaValue)=> (
                    <p onClick={ ()=>updateActiveSearchEntries({ action: 'REMOVE', value: metaValue }) }>{ metaValue }</p>
                )) }
            </div>
        </nav>
    )
}
