let FactoryCacheIntermediary: FactoryCacheService = null!;

interface FactoryEntities {
    readonly mediaBundles: Map<string, Honk.Media.MediaBundle>;
}

interface FactoryCacheServiceModule extends FactoryEntities {
}

export class FactoryCacheService implements FactoryCacheServiceModule  {
    readonly mediaBundles = new Map();

    private constructor() {}
    
    static get instance() {
        if (FactoryCacheIntermediary === null) {
            FactoryCacheIntermediary = new FactoryCacheService();
        }
        return FactoryCacheIntermediary
    }
    
    public set<F extends keyof FactoryCacheServiceModule>(values: Array<FactoryEntities[F]>) {
        
    }

    public get<F extends keyof FactoryCacheServiceModule, C extends number | Partial<{ [Key in keyof F]: F[Key] }>>(table: F, column: C) {
        
    }

}
