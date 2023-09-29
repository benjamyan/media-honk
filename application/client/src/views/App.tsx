import { default as React } from 'react';
import ReactDOM from 'react-dom';
import { GlobalConfigContextProvider } from '../context/global-config-context/GlobalConfixContext';
import { initAxiosInstance } from '../libs/axios';
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { MediaHonkHome } from './media-honk-home/MediaHonkHome';
import { AssetLibraryContextProvider, MediaPlayerContextProvider } from '../context';
import './_App.scss';

try {
    console.log(`Env: ${Client.honkConfig.ENV}`);
    const queryClient = new QueryClient()
    if (Client.honkConfig.ENV === 'staging') {
        console.log(`Init: mock-service-worker`);
        const { workerConfig } = require('../__mock__/mockService');
        workerConfig.start();
    }
    initAxiosInstance();
    ReactDOM.render(
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <GlobalConfigContextProvider>
                        <AssetLibraryContextProvider>
                            <MediaPlayerContextProvider>
                                <MediaHonkHome />
                                <ReactQueryDevtools initialIsOpen />
                            </MediaPlayerContextProvider>
                        </AssetLibraryContextProvider>
                </GlobalConfigContextProvider>
            </QueryClientProvider>
        </React.StrictMode>,
        document.getElementById('root')
    );
} catch (err) {
    console.error(err);
}
