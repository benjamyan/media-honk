import React, { useCallback } from 'react';
import { useGlobalConfigContext } from '../../context/global-config-context/GlobalConfixContext';
import { HeaderNavigation, ImageGallary, MediaLibrary, VideoPlayer } from '../../features';
import { LoaderingIndicator } from '../../components/status-windows/LoadingIndicator';
import { useAssetLibraryContext, useMediaPlayerContext } from '../../context';
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
            case 'A': return <>AUDIO TODO</>;
            case 'I': return <ImageGallary />;
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
                <MediaPlayer />
            }
            <MediaBundleOverview />
            <HeaderNavigation />
            <MediaLibrary />
        </>
    )
}
