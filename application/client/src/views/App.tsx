import ReactDOM from 'react-dom';
import { default as React, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { httpBatchLink } from '@trpc/client';

import { GlobalConfigContextProvider } from '../context/global-config-context/GlobalConfixContext';
import { initAxiosInstance } from '../libs/axios';
import { MediaHonkHome } from './media-honk-home/MediaHonkHome';
import { AssetLibraryContextProvider, MediaPlayerContextProvider } from '../context';
import { trpc } from '../api/trpc';
import './_App.scss';

try {
    console.log(`Env: ${Client.honkConfig.ENV}`);
    // const queryClient = new QueryClient();
    // const [trpcClient] = useState(() =>
    //     trpc.createClient({
    //         links: [
    //             httpBatchLink({ url: 'http://192.168.0.11:8081' }),
    //         ],
    //     }),
    // );
    if (Client.honkConfig.ENV === 'staging') {
        console.log(`Init: mock-service-worker`);
        const { workerConfig } = require('../__mock__/mockService');
        workerConfig.start();
    }
    initAxiosInstance();
    ReactDOM.render(
        <React.StrictMode>
            {/* <trpc.Provider client={trpcClient} queryClient={queryClient}> */}
                {/* <QueryClientProvider client={queryClient}> */}
                    <GlobalConfigContextProvider>
                        <AssetLibraryContextProvider>
                            <MediaPlayerContextProvider>
                                <MediaHonkHome />
                                {/* <ReactQueryDevtools initialIsOpen={false} /> */}
                            </MediaPlayerContextProvider>
                        </AssetLibraryContextProvider>
                    </GlobalConfigContextProvider>
                {/* </QueryClientProvider> */}
            {/* </trpc.Provider> */}
        </React.StrictMode>,
        document.getElementById('root')
    );
} catch (err) {
    console.error(err);
}
