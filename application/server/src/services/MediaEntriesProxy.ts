import { MediaHonkServerBase } from '../_Base';

const MediaEntriesProxy = (mediaJsonContent: Array<Honk.Media.BaselineMediaProperties>)=> {
    const mediaEntries = new Proxy(
        {} as Record<string, Honk.Media.BaselineMediaProperties>,
        {
            set(target, key: string, value: Honk.Media.BaselineMediaProperties) {
                target[key] = value;
                return true   
            },
            get(target, key: string) {
                return target[key];
            }
        }
    );
    
    if (mediaJsonContent === undefined) {
        MediaHonkServerBase.emitter('error', {
            error: new Error('Failed to get job data'),
            severity: 2
        });
    } else {
        for (const media of mediaJsonContent) {
            mediaEntries[media._guid] = media;
        }
    }

    return mediaEntries;
}

export { MediaEntriesProxy }
