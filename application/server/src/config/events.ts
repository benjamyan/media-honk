export const LIFECYCLE_EVENTS: NonNullable<HonkServer.ServerStateBucket['standing']>[] = [
    'init', 'server.start', 'server.listening', 'server.error'
]
export const INTERNAL_EVENTS = [
    'error'
]