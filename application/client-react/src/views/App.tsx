import { default as React } from 'react';
import ReactDOM from 'react-dom';
import { GlobalConfigContextProvider } from '../context/global-config-context/GlobalConfixContext';
import { initAxiosInstance } from '../libs/axios';
import { MediaHonkHome } from './media-honk-home/MediaHonkHome';
import './_App.scss';

try {
    initAxiosInstance();
    ReactDOM.render(
        <React.StrictMode>
            <GlobalConfigContextProvider>
                <MediaHonkHome />
            </GlobalConfigContextProvider>
        </React.StrictMode>,
        document.getElementById('root')
    );
} catch (err) {
    console.error(err);
}