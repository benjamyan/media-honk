import { default as React } from 'react';
import ReactDOM from 'react-dom';
import { GlobalConfigContextProvider } from '../context/global-config-context/GlobalConfixContext';
import { initAxiosInstance } from '../libs/axios';
import { MediaHonkHome } from './media-honk-home/MediaHonkHome';
import { AssetLibraryContextProvider, MediaPlayerContextProvider } from '../context';
import './_App.scss';

try {
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
