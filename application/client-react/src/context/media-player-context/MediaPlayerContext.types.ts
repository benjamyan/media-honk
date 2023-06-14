import { MediaAssetBundle } from "../../types";

export type MediaPlayerContextState = {
    selectedMedia: MediaAssetBundle | null;
    // playerType: MediaPlayerType | null;
    // bundleId: string | null;
    mediaPlaying: boolean;
    updateMediaPlayerContext: (args0: {
            action: 'UPDATE',
            payload: {
                selectedMediaId?: string | null;
                mediaPlaying?: boolean;
                // [Key in keyof Omit<MediaPlayerContextState, 'updateMediaPlayerContext'>]?: MediaPlayerContextState[Key]
            }
        })=> void;
}
