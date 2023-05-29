import axios from 'axios';
import { Honk } from 'mediahonk';

import * as get_initialConnect from './get_initialConnect';
import { get_libraryContents } from './get_libraryContents';
import * as get_castingDevices from './get_castingDevices';

import { axiosSettings } from './libs/axios';

// export interface IModel {
//     get: Record<string, Function>;
//     post: Record<string, Function>;
// }

export interface IModelGet {
    castingDevices: typeof get_castingDevices;
    initialConnection: typeof get_initialConnect;
    libraryContent: typeof get_libraryContents;
}

export default class Model {
    public get: Record<string, ()=> any> = null!;
    
    constructor() {
        this.get = {
            // initialConnection: get_initialConnect,
            // castingDevices: get_castingDevices,
            libraryContent: get_libraryContents
        }
    }

    init() {
        axios.defaults.baseURL = axiosSettings.baseURL;
    }

    libraryContentFactory(libraryEntries: Honk.Media.BasicLibraryEntry[]): Honk.Media.BasicLibraryEntry[] {
        function generateUUID() { // Public Domain/MIT
            var d = new Date().getTime();//Timestamp
            var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16;//random number between 0 and 16
                if(d > 0){//Use timestamp until depleted
                    r = (d + r)%16 | 0;
                    d = Math.floor(d/16);
                } else {//Use microseconds since page-load if supported
                    r = (d2 + r)%16 | 0;
                    d2 = Math.floor(d2/16);
                }
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        }
        libraryEntries = libraryEntries.map(
            (entry)=> ({
                ...entry,
                uuid: generateUUID() // replace this with window.crypto.randomUUID when transitioning to https
            })
        );
        return libraryEntries;
    }

}

