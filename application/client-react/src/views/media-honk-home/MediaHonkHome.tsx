import React from 'react';
import { useGlobalConfigContext } from '../../context/global-config-context/GlobalConfixContext';
import { HeaderNavigation, MediaLibrary } from '../../features';

export const MediaHonkHome = ()=> {
    const { healthStatus } = useGlobalConfigContext();
    console.log(healthStatus)
    return (
        <>
            { healthStatus !== true && (
                <div style={{
                    zIndex: 999, 
                    background: '#000', 
                    position: 'absolute', 
                    height: '100vh', 
                    width: '100%', 
                    left: 0,
                    top: 0
                }}>loading...</div>
            )}
            <HeaderNavigation />
            <MediaLibrary />
        </>
    )
}
