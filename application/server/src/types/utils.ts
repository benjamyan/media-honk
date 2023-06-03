/**
 * @link https://stackoverflow.com/a/49725198
 */
export type AtleastOneOf<T, Keys extends keyof T = keyof T> = (
    Pick<T, Exclude<keyof T, Keys>> & {
        [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
    }[Keys]
);