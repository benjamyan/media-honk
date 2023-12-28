import { BundlesModel } from "../../models";
import { $Logger } from "../../server";
import { resolveBundle } from "./resolveBundle";

export const selectAllBundles = async ()=> {
    const ResolvedBundles: Array<Honk.Server.AssetBundle> = [];
    try {
        const bundles = await BundlesModel.query().select();
        let ResolvedBundle;
        for (const bundle of bundles) {
            ResolvedBundle = await resolveBundle(bundle);
            if (ResolvedBundle === undefined) continue;
            ResolvedBundles.push(ResolvedBundle);
        }
    } catch (err) {
        $Logger.error(err);
    }
    return ResolvedBundles
}
