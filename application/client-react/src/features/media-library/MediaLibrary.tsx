import React, { useEffect, useState } from 'react';
import { get_bundlesByPage } from '../../api/get_bundlesByPage';

export const MediaLibrary = ()=> {
    const [ assetBundles, setAssetBundles ] = useState<any>([]);

    useEffect(()=> {
        get_bundlesByPage()
            .then((bundles)=> {
                if (!Array.isArray(bundles)) {
                    throw new Error('Mishapen response')
                }
                setAssetBundles(bundles);
            })
            .catch((err)=>console.error(err));
    }, [])
    // useEffect(()=> {
    //     console.log(assetBundles)
    // }, [ assetBundles ])

    return (
        <>MediaLibrary</>
    )
}