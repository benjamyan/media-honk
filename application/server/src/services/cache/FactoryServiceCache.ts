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
    
    public set(values: Honk.Server.AssetBundle[]) {
        for (const bundle of values) {
            this.factoryAssets.set(bundle._guid, bundle);
        }
    }

    public get(value: string | Partial<{ [ Prop in keyof Honk.Server.AssetBundle ]-?: Honk.Server.AssetBundle[Prop] }> ): Honk.Server.AssetBundle | undefined {
        if (typeof(value) == 'string') {
            return this.factoryAssets.get(value);
        } else {
            console.log("TODO FactoryServiceCache.get FOR objects");
            //
        }
    }

}

export const $FactoryCache = FactoryServiceCache.instance;
