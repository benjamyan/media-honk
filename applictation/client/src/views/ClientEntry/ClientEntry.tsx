import * as React from 'react';

import { get_initialConnect } from '../../api';
import { get_libraryContents } from '../../api/get_libraryContents';
import { MediaLibraryEntry, MediaFilters } from '../../types';
import { VideoPlayer, ClientNavigation, MediaLibrary } from '../../features';
import './_ClientEntry.scss';

export default function MediaServerClientEntry() {
    const [validConnection, setValidConnection] = React.useState<boolean | undefined>(undefined);
    const [libraryEntries, setLibraryEntries] = React.useState<MediaLibraryEntry[]>([]);
    const [activeMedia, setActiveMedia] = React.useState<MediaLibraryEntry | null>(null);
    const [libFilter, setLibFilter] = React.useState<MediaFilters>({
        mediaSource: 'ALL',
        categories: [],
        actors: 'ANY',
        search: ''
    });
    
    const pageRef = React.useRef<HTMLElement>();
    
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
                        setLibraryEntries(library)
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
                <ClientNavigation
                    libraryEntries={ libraryEntries }
                    libFilterState={{
                        libFilter,
                        setLibFilter
                    }}
                />
                <MediaLibrary 
                    libraryEntries={ libraryEntries }
                    libFilter={ libFilter }
                    activeMediaState={{
                        activeMedia,
                        setActiveMedia
                    }}
                />
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
