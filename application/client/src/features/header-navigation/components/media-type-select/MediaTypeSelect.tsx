import React, { useMemo } from 'react'
import { useAssetLibraryContext } from '../../../../context';
import { MEDIA_TYPES } from '../../../../config/copy-resolutions';

import './_MediaTypeSelect.scss';
import { MediaView } from '../../../../context/asset-library-context/AssetLibraryContext.types';

export const MediaTypeSelect = () => {
    const { assetBucket, mediaView, updateLibraryContext } = useAssetLibraryContext();

    const mediaTypeOptionList = useMemo(()=> {
        const mediaTypeOptions: Record<string, string> = {};
        let currType: string;
        for (const bundle in assetBucket) {
            currType = assetBucket[bundle].type;
            if (mediaTypeOptions[currType] !== undefined) continue;
            if (MEDIA_TYPES[currType as Honk.Media.StoredMediaTypes] === undefined) continue;
            mediaTypeOptions[currType] = MEDIA_TYPES[currType as Honk.Media.StoredMediaTypes];
        }
        return mediaTypeOptions
    }, [ assetBucket ]);
    
    return (
        <select className='mediatype__select' defaultValue={'NULL'} value={mediaView[0]} onChange={(e)=>
            updateLibraryContext({
                action: 'UPDATE',
                payload: {
                    mediaView: e.target.value !== 'NULL' ? [ e.target.value ] as MediaView : 'NULL' 
                }
            })
        }>
            <option value={'NULL'}>All</option>
            { Object.entries(mediaTypeOptionList).map((mediaType, i)=>
                <option 
                    key={`mediatypeselect-${i}`}
                    // selected={ mediaView[0] == mediaType[0] }
                    value={mediaType[0]} 
                    onClick={()=>{
                        console.log(1)
                    }}>
                        { mediaType[1] }
                    </option>
            )}
        </select>
    )
}
