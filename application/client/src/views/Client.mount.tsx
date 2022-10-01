import * as React from 'react'
import * as ReactDOM from 'react-dom'
// import axios from 'axios';

import AppEntry from './ClientEntry/ClientEntry'

/// @ts-ignore
// import browserEnv from 'browser-env';
// browserEnv(['navigator']);


ReactDOM.render(
    <React.StrictMode>
        <AppEntry />
    </React.StrictMode>,
    document.getElementById('root')
);
