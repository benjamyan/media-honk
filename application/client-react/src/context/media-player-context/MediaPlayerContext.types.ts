export type MediaPlayerType = 'VIDEO' | 'AUDIO' | 'IMAGE';
export type MediaPlayerContextState = {
    mediaType: MediaPlayerType | null;
    bundleId: string | null;
    mediaPlaying: boolean;
    updateMediaPlayerContext: (args0: {
            action: 'UPDATE',
            payload: { 
                [Key in keyof Omit<MediaPlayerContextState, 'updateMediaPlayerContext'>]?: MediaPlayerContextState[Key]
            }
        })=> void;
}
