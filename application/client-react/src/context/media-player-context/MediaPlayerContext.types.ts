
export type MediaPlayerContextState = {
    bundleId: string | null;
    updateMediaPlayerContext: (args0: {
            action: 'UPDATE',
            payload: { 
                [Key in keyof Omit<MediaPlayerContextState, 'updateMediaPlayerContext'>]: MediaPlayerContextState[Key]
            }
        })=> void;
}
