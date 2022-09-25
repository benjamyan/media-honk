import * as React from 'react';

import { get_initialConnect } from '../../api';
import { get_libraryContents } from '../../api/get_libraryContents';
import { BaselineLibraryEntry } from '../../types';
import { VideoPlayer } from '../../features';
import './_ClientEntry.scss';

interface LibraryFilters {
    mediaSource: string | 'ALL';
    categories: string[];
    actors: string | 'ANY';
    search: string;
}
interface FilterOptions {
    titles: string[];
    actors: string[];
    categories: string[];
}

export default function MediaServerClientEntry() {
    const [validConnection, setValidConnection] = React.useState<boolean | undefined>(undefined);
    const [libraryEntries, setLibraryEntries] = React.useState<BaselineLibraryEntry[]>([]);
    const [activeMedia, setActiveMedia] = React.useState<BaselineLibraryEntry | null>(null);
    const [libFilter, setLibFilter] = React.useState<LibraryFilters>({
        mediaSource: 'ALL',
        categories: [],
        actors: 'ANY',
        search: ''
    });
    const [ libFilterOptions, setLibFilterOptions ] = React.useState<FilterOptions>({
        titles: [],
        actors: [],
        categories: []
    });

    const searchRef = React.useRef<HTMLInputElement | any>();
    const pageRef = React.useRef<HTMLElement>();
    const VideoList = React.useCallback(
        ()=> {
            
            return <div className={`video__library ${activeMedia !== null ? 'disabled' : ''}`}>
                { libraryEntries.map((entry, index)=> {
                    
                    // media type check
                    if (libFilter.mediaSource !== undefined && libFilter.mediaSource !== 'ALL') {
                        if (entry.mediaSource !== libFilter.mediaSource) {
                            return <></>
                        }
                    }

                    if (libFilter.categories !== undefined && libFilter.categories.length > 0) {
                        let shouldRender: boolean = false;

                        categoryCheck:
                        for (const category of libFilter.categories) {
                            if (entry.categories.includes(category)) {
                                shouldRender = true;
                                break categoryCheck;
                            }
                        }

                        if (!shouldRender) {
                            return <></>
                        }
                    }

                    // actor check
                    if (libFilter.actors !== undefined && libFilter.actors !== 'ANY') {
                        if (!entry.actors.includes(libFilter.actors)) {
                            return <></>
                        }
                    }
                    
                    return (
                        <div key={`entry${index}`} className='video__library--entry' onClick={ ()=> setActiveMedia(entry) }>
                            <img src={`/server/image?file=${entry.coverImageUrl}`} />
                            <div>
                                <h4>{ entry.title }</h4>
                                <p>{ entry.actors.join(', ') }</p>
                            </div>
                        </div>
                    )
                }) }
            </div>
        },
        [ libraryEntries, libFilter.actors, libFilter.mediaSource, libFilter.categories ]
    );

    React.useEffect(()=>{
        pageRef.current = document.getElementById('root') as HTMLElement;
        (async function() {
            const init = await get_initialConnect();
            setValidConnection(init)
        })()
    }, [])

    React.useEffect(()=>{
        if (!!validConnection) {
            (async function(){
                await get_libraryContents()
                    .then((library)=>{
                        let totalOption: FilterOptions = {
                            actors: [],
                            categories: [],
                            titles: []
                        }
                        for (const entry of library) {
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

                        setLibraryEntries(library)
                        setLibFilterOptions({...totalOption})
                    })
                    .catch(err=> {
                        console.log(err)
                    });
            })()
        }
    }, [validConnection])

    React.useEffect(()=> {
        if (activeMedia !== null) {
            pageRef.current?.classList.add('media__active')
        } else if (pageRef.current?.classList.contains('media__active')) {
            pageRef.current?.classList.remove('media__active')
        }
    }, [activeMedia])

    if (!!validConnection) {
        return (
            <>
                { activeMedia !== null &&
                    <VideoPlayer 
                        activeVideo={ activeMedia }
                        closeVideo={ ()=> setActiveMedia(null) } 
                    />
                }
                <nav className='video__filter'>
                    <select 
                        placeholder='Media type' 
                        value={ libFilter.mediaSource } 
                        onChange={
                            (e)=> setLibFilter({ 
                                ...libFilter,
                                mediaSource: e.target.value, 
                                // actors: libFilter. 
                            })
                        }>
                            <option value='ALL'>All</option>
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
                                    .map((entry)=>(
                                        <option value={entry}>{entry}</option>
                                    ))
                            }
                    </select>
                    <div ref={ searchRef } className='video__filter--search'>
                        <input 
                            placeholder='Search terms' 
                            type='text' 
                            value={ libFilter.search }
                            onFocus={()=>{
                                searchRef.current.classList.add('active')
                            }}
                            onBlur={()=>{
                                setTimeout( ()=> {
                                    searchRef.current.classList.remove('active')
                                }, 100);
                            }}
                            onChange={(e)=> {
                                setLibFilter({
                                    ...libFilter,
                                    search: e.target.value
                                })
                            }} 
                        />
                        <button onClick={()=>setLibFilter({ ...libFilter, actors: 'ANY', categories: [], search: ''})}>
                            clear
                        </button>
                        { libFilter.search !== undefined && libFilter.search.length > 0 && 
                            <div className='video__filter--search-results'>
                                <h5>Categories:</h5>
                                { libFilterOptions.categories
                                    .reduce((previousValue: string[], currentValue: string, _index, _acc) => {
                                        if (libFilter.search !== undefined && typeof(currentValue) === 'string' && !previousValue.includes(currentValue)) {
                                            
                                            if (currentValue.toLowerCase().startsWith(libFilter.search.toLowerCase())) {
                                                previousValue.push(currentValue);
                                            }
                                        }
                                        return previousValue;
                                    }, [])
                                    .map((entry)=>(
                                        <p onClick={ ()=> {
                                            setLibFilter({
                                                ...libFilter,
                                                categories: [ ...libFilter.categories, entry ],
                                                search: ''
                                            })
                                        } }>{entry}</p>
                                    ))
                                }
                                <h5>Actors:</h5>
                                { libFilterOptions.actors
                                    .reduce((previousValue: string[], currentValue: string, _index, _acc) => {
                                        if (libFilter.search !== undefined && typeof(currentValue) === 'string' && !previousValue.includes(currentValue)) {
                                            const searchFirstLast: string[] = (
                                                currentValue.indexOf(' ') > -1 
                                                    ? currentValue.split(' ') 
                                                    : [ currentValue ]
                                            );
                                            for (const name of searchFirstLast) {
                                                if (name.toLowerCase().startsWith(libFilter.search.toLowerCase())) {
                                                    previousValue.push(currentValue);
                                                }
                                            }
                                        }
                                        return previousValue;
                                    }, [])
                                    .map((entry)=>(
                                        <p onClick={ ()=> {
                                            setLibFilter({
                                                ...libFilter,
                                                actors: entry,
                                                search: ''
                                            })
                                        } }>{entry}</p>
                                    ))
                                }
                            </div> 
                        }
                    </div>
                    <div className='video__filter--current'>
                        { libFilter.actors !== 'ANY' && libFilter.actors.length > 0 && (
                            <p onClick={()=> setLibFilter({...libFilter, actors: 'ANY'})}>{ libFilter.actors }</p>
                        )}
                        { libFilter.categories.length > 0 && libFilter.categories.map((category)=>(
                            <p onClick={()=> {
                                const newCategories = (
                                    libFilter.categories
                                        .map((cat)=> {
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
                            }}>{ category }</p>
                        ))
                        }
                    </div>
                </nav>
                <VideoList />
            </>
        )
    } else if (validConnection === undefined) {
        return (
            <>loading...</>
        )
    } else {
        return (
            <>Error</>
        )
    }
}
