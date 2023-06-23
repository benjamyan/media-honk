import { default as React } from 'react';
import ReactDOM from 'react-dom';
import { GlobalConfigContextProvider } from '../context/global-config-context/GlobalConfixContext';
import { initAxiosInstance } from '../libs/axios';
import { MediaHonkHome } from './media-honk-home/MediaHonkHome';
import { AssetLibraryContextProvider, MediaPlayerContextProvider } from '../context';
import './_App.scss';

try {
    console.log(`Env: ${Client.honkConfig.ENV}`);
    if (Client.honkConfig.ENV === 'staging') {
        console.log(`Init: mock-service-worker`);
        const { workerConfig } = require('../__mock__/mockService');
        workerConfig.start();
    }
    initAxiosInstance();
    ReactDOM.render(
        <React.StrictMode>
            <GlobalConfigContextProvider>
                    <AssetLibraryContextProvider>
                        <MediaPlayerContextProvider>
                                <MediaHonkHome />
                        </MediaPlayerContextProvider>
                    </AssetLibraryContextProvider>
            </GlobalConfigContextProvider>
        </React.StrictMode>,
        document.getElementById('root')
    );
} catch (err) {
    console.error(err);
}
