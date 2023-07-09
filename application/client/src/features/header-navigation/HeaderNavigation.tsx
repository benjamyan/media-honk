import React, { useEffect, useReducer, useState } from 'react';

import { MetaSearchBar } from './components/meta-search/MetaSearchBar';
import { MediaQueue } from './components/media-queue/MediaQueue';

import './_HeaderNavigation.scss';
import { MediaTypeSelect } from './components/media-type-select/MediaTypeSelect';
import { useAssetLibraryContext } from '../../context';

export const HeaderNavigation = ()=> {
    const { mediaView, libraryView, metaSearch, updateLibraryContext } = useAssetLibraryContext();
    const [ searchBarFocused, setSearchBarFocused ] = useState(false);
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

    useEffect(()=>{
        updateLibraryContext({
            action: 'UPDATE',
            payload: {
                metaSearch: activeSearchEntries
            }
        })
    }, [ activeSearchEntries ])
    
    return (
        <nav className='header__nav'>
            <div className='header__nav--interact'>
                <MetaSearchBar updateSearchValue={updateActiveSearchEntries} updateSearchFocus={setSearchBarFocused} />
                { !searchBarFocused &&
                    <>
                        <div className='header__nav--directions'>
                            { mediaView.length > 0 || libraryView == 'GRID' &&
                                <button 
                                    className='header__nav--directions-home' 
                                    onClick={()=>updateLibraryContext({
                                        action: 'UPDATE',
                                        payload: {
                                            mediaView: 'NULL',
                                            libraryView: 'ROW',
                                            metaSearch: []
                                        }
                                    })}
                                >
                                    &#9750;
                                </button>
                            }
                            <MediaTypeSelect />
                        </div>
                        <MediaQueue />
                    </>
                }
            </div>
            <div className='header__nav--searching'>
                { metaSearch.map((metaValue)=> (
                    <p onClick={ ()=>updateActiveSearchEntries({ action: 'REMOVE', value: metaValue }) }>{ metaValue }</p>
                )) }
            </div>
        </nav>
    )
}
