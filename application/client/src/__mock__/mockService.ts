import { setupWorker, rest } from 'msw';
import { ENDPOINTS } from '../api/_endpoints';
import { mockBundles, mockMeta } from './data';

export const workerConfig = setupWorker(
    rest.get(ENDPOINTS.healthCheck, async (_req, res, ctx)=> res(ctx.status(200))),
    rest.get(ENDPOINTS.getMeta, async(req, res, ctx)=> {
        let metaRes: Record<'artist' | 'category', string[] | undefined> = mockMeta;
        if (req.params.artist) {
            metaRes.category = undefined;
        } else if (req.params.category) {
            metaRes.artist = undefined;
        }
        return res(ctx.json(metaRes))
    }),
    rest.get(ENDPOINTS.getBundles, async (req, res, ctx)=> {
        const { params: { artist, category, page, limit, type } } = req;
        let bundles: Array<Honk.Media.AssetBundle> = mockBundles;
        if (artist && category) {
            return res(ctx.text('Cannot accept both an artist and category query'));
        } else if (artist) {
            if (Array.isArray(artist)) {
                for (const art of artist) {
                    bundles = bundles.reduce((bundleAccumulator, bundle)=> {
                        if (bundle.category.includes(art)) bundleAccumulator.push(bundle);
                        return bundleAccumulator
                    }, [] as Array<Honk.Media.AssetBundle>);
                }
            } else {
                bundles = bundles.reduce((bundleAccumulator, bundle)=> {
                    if (bundle.category.includes(artist as string)) bundleAccumulator.push(bundle);
                    return bundleAccumulator
                }, [] as Array<Honk.Media.AssetBundle>);
            }
        } else if (category) {
            if (Array.isArray(category)) {
                for (const cat of category) {
                    bundles = bundles.reduce((bundleAccumulator, bundle)=> {
                        if (bundle.category.includes(cat)) bundleAccumulator.push(bundle);
                        return bundleAccumulator
                    }, [] as Array<Honk.Media.AssetBundle>);
                }
            } else {
                bundles = bundles.reduce((bundleAccumulator, bundle)=> {
                    if (bundle.category.includes(category as string)) bundleAccumulator.push(bundle);
                    return bundleAccumulator
                }, [] as Array<Honk.Media.AssetBundle>);
            }
        }
        if (page) {
            console.warn('TODO getBundles page');
        }
        if (limit) {
            console.warn('TODO getBundles limit');
        }
        if (type) {
            bundles = bundles.reduce((bundleAccumulator, bundle)=> {
                if (bundle.type === type) bundleAccumulator.push(bundle);
                return bundleAccumulator
            }, [] as Array<Honk.Media.AssetBundle>);
        }
        return res(ctx.json(mockBundles));
    }), 
    rest.get(ENDPOINTS.getCoverImage, async (req, res, ctx)=> {
        const { id } = req.params;
        if (!id) {
            return res(ctx.text('ID param required'));
        }
        const cover = mockBundles.find(({_guid})=> _guid === id);
        if (cover) {
            if (cover.type.startsWith('A')) {
                // return res(require('./covers/audio/2.jpg'));
            } else if (cover.type.startsWith('V')) {
                // return res(require('./covers/video/2.jpg'));
            } else if (cover.type.startsWith('I')) {
                // return res(require('./covers/image/2.jpg'));
            }
        }
        return res(ctx.status(404));
    })
);

// export const initMockServiceWorker = ()=> worker.start();
// worker.start();
