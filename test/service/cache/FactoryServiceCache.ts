import { v4 } from "uuid";

let FactoryCacheIntermediary: FactoryServiceCache = null!;

interface FactoryEntities {
    // readonly assetBundles: Map<string, Honk.Server.AssetBundle>;
}

interface FactoryServiceCacheModule extends FactoryEntities {
}

class FactoryServiceCache implements FactoryServiceCacheModule  {
    private factoryAssets: Map<string, Honk.Server.AssetBundle> = new Map();

    private constructor() {}
    
    static get instance() {
        if (FactoryCacheIntermediary === null) {
            FactoryCacheIntermediary = new FactoryServiceCache();
        }
        return FactoryCacheIntermediary
    }

    private determineAssetExistence(bundle: Honk.Server.AssetBundle) {
        let currentAsset: Honk.Server.AssetBundle;
        for (const assetGuid of [...this.factoryAssets.keys()]) {
            currentAsset = this.factoryAssets.get(assetGuid)!;
            if (currentAsset.title !== bundle.title || currentAsset.subTitle !== bundle.subTitle) continue;
            return currentAsset;
        }
        return false;
    }
    
    public set(values: Honk.Server.AssetBundle[]) {
        for (const bundle of values) {
            if (this.determineAssetExistence(bundle)) continue;
            this.factoryAssets.set(bundle._guid, bundle);
        }
    }

    public get(value: string | Honk.Server.AssetBundle/*Partial<{ [ Prop in keyof Honk.Server.AssetBundle ]-?: Honk.Server.AssetBundle[Prop] }>*/ ): Honk.Server.AssetBundle | undefined {
        if (typeof(value) == 'string') {
            return this.factoryAssets.get(value);
        } else {
            return this.determineAssetExistence(value) || undefined
        }
    }

}

export const $FactoryCache = FactoryServiceCache.instance;
