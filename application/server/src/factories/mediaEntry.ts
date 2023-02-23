import { v4 } from 'uuid';

export function build_mediaEntry(givenProps: Omit<Honk.Media.BaselineMediaProperties, '_guid'>): Honk.Media.BaselineMediaProperties | Error {
    try {
        const { title, categories, artists } = givenProps;
        if (!title || !categories || !artists) {
            throw new Error(`Missing required fields (Factories.build_mediaEntry)`)
        } else {
            const newMediaEntry = {
                title,
                subtitle: givenProps.subtitle,
                categories,
                artists,
                _guid: v4()
            }

            return newMediaEntry
        }
    } catch (err) {
        return err instanceof Error ? err : new Error(`Unhandled exception. Factories.build_mediaEntry`);
    }
}
