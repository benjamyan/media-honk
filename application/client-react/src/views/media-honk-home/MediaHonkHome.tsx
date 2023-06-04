import React from 'react';
import { useGlobalConfigContext } from '../../context/global-config-context/GlobalConfixContext';
import { HeaderNavigation, MediaLibrary } from '../../features';
import { LoaderingIndicator } from '../../components/status-windows/LoadingIndicator';

export const MediaHonkHome = ()=> {
    const { healthStatus } = useGlobalConfigContext();
    console.log(healthStatus)
    return (
        <>
            { healthStatus !== true && (
                <LoaderingIndicator />
            )}
            <HeaderNavigation />
            <MediaLibrary />
        </>
    )
}
