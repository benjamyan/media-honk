import { MediaAssetBundle } from "../../types";

export type UpdateMediaPlayerContextParams = {
    action: 'UPDATE'
    payload: {
        selectedMediaId?: string | null;
        mediaPlaying?: boolean;
        currentMediaId?: number | null;
        mediaQueue?: string | null;
    }
} | {
    action: 'RESET'
}

export type MediaPlayerContextState = {
    selectedMedia: MediaAssetBundle | null;
    currentMediaId: number | null;
    mediaPlaying: boolean;
    mediaQueue: string[];
    updateMediaPlayerContext: (args0: UpdateMediaPlayerContextParams)=> void;
}
