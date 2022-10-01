import React from 'react';

import { MediaLibraryEntry, MediaFilters } from '../../types';
import { FilterOptions } from './types';

interface ClientNavigationProps {
    libraryEntries: MediaLibraryEntry[];
    libFilterState: {
        libFilter: MediaFilters;
        setLibFilter: React.Dispatch<React.SetStateAction<MediaFilters>> // (args0: Partial<LibraryFilters>)=> void;
    };
}

export const ClientNavigation = (props: ClientNavigationProps) => {
    const { 
        libFilterState: {
            libFilter,
            setLibFilter
        }, 
        libraryEntries 
    } = props;

    const [ libFilterOptions, setLibFilterOptions ] = React.useState<FilterOptions>({
        titles: [],
        actors: [],
        categories: []
    });
    const searchRef = React.useRef<HTMLInputElement | any>();

    React.useEffect(()=>{
        let totalOption: FilterOptions = {
            actors: [],
            categories: [],
            titles: []
        }
        for (const entry of libraryEntries) {
            if (!!entry.actors && entry.actors.length > 0) {
                entry.actors.forEach((actor)=>{
                    libFilterOptions.actors.includes(actor)
                        ? null
                        : totalOption.actors.push(actor)
                })
            }
            if (!!entry.categories && entry.categories.length > 0) {
                entry.categories.forEach((category)=>{
                    libFilterOptions.categories.includes(category)
                        ? null
                        : totalOption.categories.push(category)
                })
            }
            if (!!entry.title && entry.title.length > 0) {
                totalOption.titles.push(entry.title)
            }
        }
        setLibFilterOptions({...totalOption})
    }, [ libraryEntries ])

    return (
        <nav className='video__filter'>
            <select
                placeholder='Media type'
                value={libFilter.mediaSource}
                onChange={
                    (e) => setLibFilter({
                        ...libFilter,
                        mediaSource: e.target.value,
                        // actors: libFilter. 
                    })
                }>
                <option key={`media-type-option-ALL`} value='ALL'>All</option>
                {
                    libraryEntries
                        .reduce((previousValue: string[], currentValue, _index, _acc) => {
                            if (currentValue.mediaSource !== undefined) {
                                if (!previousValue.includes(currentValue.mediaSource)) {
                                    previousValue.push(currentValue.mediaSource);
                                }
                            }
                            return previousValue;
                        }, [])
                        .map((entry, index) => (
                            <option key={`media-type-option-${index}`} value={entry}>{entry}</option>
                        ))
                }
            </select>
            <div ref={searchRef} className='video__filter--search'>
                <input
                    placeholder='Search terms'
                    type='text'
                    value={libFilter.search}
                    onFocus={() => {
                        searchRef.current.classList.add('active')
                    }}
                    onBlur={() => {
                        setTimeout(() => {
                            searchRef.current.classList.remove('active')
                        }, 100);
                    }}
                    onChange={(e) => {
                        setLibFilter({
                            ...libFilter,
                            search: e.target.value
                        })
                    }}
                />
                <button onClick={() => setLibFilter({ ...libFilter, actors: 'ANY', categories: [], search: '' })}>
                    clear
                </button>
                {libFilter.search !== undefined && libFilter.search.length > 0 &&
                    <div className='video__filter--search-results'>
                        <h5>Categories:</h5>
                        {libFilterOptions.categories
                            .reduce((previousValue: string[], currentValue: string, _index, _acc) => {
                                if (libFilter.search !== undefined && typeof (currentValue) === 'string' && !previousValue.includes(currentValue)) {

                                    if (currentValue.toLowerCase().startsWith(libFilter.search.toLowerCase())) {
                                        previousValue.push(currentValue);
                                    }
                                }
                                return previousValue;
                            }, [])
                            .map((entry, index) => (
                                <p
                                    key={`categories-${index}`} 
                                    onClick={() => {
                                        setLibFilter({
                                            ...libFilter,
                                            categories: [...libFilter.categories, entry],
                                            search: ''
                                        })
                                    }}>
                                        {entry}
                                </p>
                            ))
                        }
                        <h5>Actors:</h5>
                        {libFilterOptions.actors
                            .reduce((previousValue: string[], currentValue: string, _index, _acc) => {
                                if (libFilter.search !== undefined && typeof (currentValue) === 'string' && !previousValue.includes(currentValue)) {
                                    const searchFirstLast: string[] = (
                                        currentValue.indexOf(' ') > -1
                                            ? currentValue.split(' ')
                                            : [currentValue]
                                    );
                                    for (const name of searchFirstLast) {
                                        if (name.toLowerCase().startsWith(libFilter.search.toLowerCase())) {
                                            previousValue.push(currentValue);
                                        }
                                    }
                                }
                                return previousValue;
                            }, [])
                            .map((entry, index) => (
                                <p 
                                    key={`actors-${index}`}
                                    onClick={() => {
                                        setLibFilter({
                                            ...libFilter,
                                            actors: entry,
                                            search: ''
                                        })
                                    }}>
                                        {entry}
                                </p>
                            ))
                        }
                    </div>
                }
            </div>
            <div className='video__filter--current'>
                {libFilter.actors !== 'ANY' && libFilter.actors.length > 0 && (
                    <p key={`select-ANY`} onClick={() => setLibFilter({ ...libFilter, actors: 'ANY' })}>{libFilter.actors}</p>
                )}
                {libFilter.categories.length > 0 && libFilter.categories.map((category, index) => (
                    <p 
                        key={`menu-select-${index}`}
                        onClick={() => {
                            const newCategories = (
                                libFilter.categories
                                    .map((cat) => {
                                        if (cat !== category) {
                                            return cat
                                        }
                                        return false
                                    })
                                    .filter(Boolean)
                            )
                            setLibFilter({
                                ...libFilter,
                                categories: [...newCategories as string[]]
                            })
                        }}>
                            {category}
                        </p>
                ))
                }
            </div>
        </nav>
    )
}
