import React, { useCallback } from 'react';
import { useGlobalConfigContext } from '../../context/global-config-context/GlobalConfixContext';
import { HeaderNavigation, MediaLibrary } from '../../features';
import { LoaderingIndicator } from '../../components/status-windows/LoadingIndicator';
import { useAssetLibraryContext, useMediaPlayerContext } from '../../context';
import { CoverImage } from '../../components/cover-images/CoverImage';
import { AssetOverview } from '../../features/asset-overview/AssetOverview';

export const MediaHonkHome = ()=> {
    const { healthStatus } = useGlobalConfigContext();
    const { assetBucket } = useAssetLibraryContext();
    const { bundleId, mediaPlaying } = useMediaPlayerContext();
    
    const MediaBundleOverview = useCallback(()=> {
        if (assetBucket == null) return <></>;
        if (bundleId == null) return <></>;
        return <AssetOverview mediaAsset={assetBucket[bundleId]} />
    }, [ bundleId ]);

    return (
        <>
            { healthStatus !== true && (
                <LoaderingIndicator />
            )}
            { mediaPlaying &&
                <>TODO</>
            }
            <MediaBundleOverview />
            <HeaderNavigation />
            <MediaLibrary />
        </>
    )
}
