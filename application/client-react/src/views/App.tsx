import { default as React } from 'react';
import ReactDOM from 'react-dom';
import { GlobalConfigContextProvider } from '../context/global-config-context/GlobalConfixContext';
import { setAxiosGlobalDefaults } from '../libs/axios/defaults';
import { setupAxiousInterceptors } from '../libs/axios/interceptors';
import { MediaHonkHome } from './media-honk-home/MediaHonkHome';

try {
    setAxiosGlobalDefaults()
    setupAxiousInterceptors()
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
