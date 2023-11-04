import React from 'react';
import { useGlobalConfigContext } from '../../context/global-config-context/GlobalConfixContext';
import { HeaderNavigation, ImageGallary, MediaLibrary, VideoPlayer } from '../../features';
import { LoaderingIndicator } from '../../components/status-windows/LoadingIndicator';
import { useAssetLibraryContext, useMediaPlayerContext } from '../../context';
import { AssetOverview } from '../../features/asset-overview/AssetOverview';

const MediaPlayer = ()=> {
    const { selectedMedia, mediaPlaying } = useMediaPlayerContext();

    if (!mediaPlaying || !selectedMedia) return null
    switch (selectedMedia.type[0]) {
        case 'A': return <>AUDIO TODO</>;
        case 'I': return <ImageGallary />;
        case 'V': 
        default: return <VideoPlayer />;
    }
}

const MediaOverview = ()=> {
    const { assetBucket } = useAssetLibraryContext();
    const { selectedMedia } = useMediaPlayerContext();
    
    if (assetBucket == null) return <></>;
    if (selectedMedia == null) return <></>;
    return <AssetOverview mediaAsset={selectedMedia} />
}

export const MediaHonkHome = ()=> {
    const { healthStatus } = useGlobalConfigContext();
    
    if (!healthStatus) {
        return <LoaderingIndicator />
    }
    return (
        <>
            <MediaPlayer />
            <MediaOverview />
            <HeaderNavigation />
            <MediaLibrary />
        </>
    )
}
