import React, { useCallback } from 'react';
import { useGlobalConfigContext } from '../../context/global-config-context/GlobalConfixContext';
import { HeaderNavigation, MediaLibrary, VideoPlayer } from '../../features';
import { LoaderingIndicator } from '../../components/status-windows/LoadingIndicator';
import { useAssetLibraryContext, useMediaPlayerContext } from '../../context';
import { CoverImage } from '../../components/cover-images/CoverImage';
import { AssetOverview } from '../../features/asset-overview/AssetOverview';

export const MediaHonkHome = ()=> {
    const { healthStatus } = useGlobalConfigContext();
    const { assetBucket } = useAssetLibraryContext();
    const { selectedMedia, mediaPlaying } = useMediaPlayerContext();
    
    const MediaBundleOverview = useCallback(()=> {
        if (assetBucket == null) return <></>;
        if (selectedMedia == null) return <></>;
        return <AssetOverview mediaAsset={selectedMedia} />
    }, [ selectedMedia ]);

    const MediaPlayer = useCallback(()=> {
        if (!mediaPlaying || !selectedMedia) return null
        switch (selectedMedia.type[0]) {
            case 'A': return <></>;
            case 'I': return <></>;
            case 'V': 
            default: return <VideoPlayer />;
        }
    }, [ mediaPlaying ])

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
