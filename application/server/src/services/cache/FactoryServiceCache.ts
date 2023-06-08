import { v4 } from "uuid";

let FactoryCacheIntermediary: FactoryServiceCache = null!;

interface FactoryEntities {
    // readonly assetBundles: Map<string, Honk.Media.AssetBundle>;
}

interface FactoryServiceCacheModule extends FactoryEntities {
}

class FactoryServiceCache implements FactoryServiceCacheModule  {
    private factoryAssets: Map<string, Honk.Media.AssetBundle> = new Map();

    private constructor() {}
    
    static get instance() {
        if (FactoryCacheIntermediary === null) {
            FactoryCacheIntermediary = new FactoryServiceCache();
        }
        return FactoryCacheIntermediary
    }
    
    public set(values: Honk.Media.AssetBundle[]) {
        for (const bundle of values) {
            this.factoryAssets.set(bundle._guid, bundle);
        }
    }

    public get(value: typeof v4 | Partial<{ [ Prop in keyof Honk.Media.AssetBundle ]-?: Honk.Media.AssetBundle[Prop] }> ): Honk.Media.AssetBundle | undefined {
        if (typeof(value) == 'string') {
            return this.factoryAssets.get(value);
        } else {
            //
        }
    }

}

export const $FactoryCache = FactoryServiceCache.instance;
