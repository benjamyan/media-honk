import React from 'react';

import { MediaLibraryEntry, MediaFilters } from '../../types';

interface MediaLibraryProps {
    libraryEntries: MediaLibraryEntry[];
    libFilter: MediaFilters;
    activeMediaState: {
        activeMedia: MediaLibraryEntry | null;
        setActiveMedia: React.Dispatch<React.SetStateAction<MediaLibraryEntry | null>>
    }
}

export const MediaLibrary = (props: MediaLibraryProps) => {
    const {
        libraryEntries,
        libFilter,
        activeMediaState: {
            activeMedia,
            setActiveMedia
        }
    } = props;

    // const visibleMediaRef = React.useRef<HTMLElement[]>([]);

    // React.useEffect(() => {
    //     document.addEventListener("DOMContentLoaded", function () {
    //         var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

    //         if ("IntersectionObserver" in window) {
    //             let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
    //                 entries.forEach(function (entry) {
    //                     if (entry.isIntersecting) {
    //                         let lazyImage = entry.target;
    //                         lazyImage.src = lazyImage.dataset.src;
    //                         lazyImage.srcset = lazyImage.dataset.srcset;
    //                         lazyImage.classList.remove("lazy");
    //                         lazyImageObserver.unobserve(lazyImage);
    //                     }
    //                 });
    //             });

    //             lazyImages.forEach(function (lazyImage) {
    //                 lazyImageObserver.observe(lazyImage);
    //             });
    //         } else {
    //             // Possibly fall back to event handlers here
    //         }
    //     });
    // }, [])

    return (
        <div className={`video__library ${activeMedia !== null ? 'disabled' : ''}`}>
            { libraryEntries.map((entry, index) => {

                // media type check
                if (libFilter.mediaSource !== undefined && libFilter.mediaSource !== 'ALL') {
                    if (entry.mediaSource !== libFilter.mediaSource) {
                        return <></>
                    }
                }

                if (libFilter.categories !== undefined && libFilter.categories.length > 0) {
                    let shouldRender: boolean = true;

                    categoryCheck:
                    for (const category of libFilter.categories) {
                        if (!entry.categories.includes(category)) {
                            shouldRender = false;
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
                    <div key={`entry${index}`} className='video__library--entry'>
                        <img 
                            src={`/server/image?file=${entry.coverUrl}`} 
                            loading="lazy" 
                            onClick={() => setActiveMedia(entry)} 
                        />
                        <div>
                            <h4>{entry.title}</h4>
                            <p>{entry.actors.join(', ')}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
