import React, { createContext, useContext, useEffect, useState } from 'react';
import { get_healthCheck } from '../../api/get_healthCheck';
import { GlobalConfigOptions, HealthStatus, LayoutOption, ThemeOption } from './GlobalConfigContext.types';

const GlobalConfigContext = createContext<GlobalConfigOptions>(undefined!);

const GlobalConfigContextProvider = ({ children }: {children: React.ReactNode}) => {
    const [ healthStatus, setHealthStatus ] = useState<HealthStatus>(false);
    const [ layout, setLayout ] = useState<LayoutOption>('GRID');
    const [ theme, setTheme ] = useState<ThemeOption>('DARK');
    
    const updateGlobalConfig = ()=> {

    }
    
    useEffect(()=> {
        get_healthCheck()
            .then((response)=>{
                setHealthStatus(response);
            })
            .catch((err=>setHealthStatus(err)))
    }, [])

    return (
        <GlobalConfigContext.Provider value={{
            healthStatus,
            layout,
            theme,
            updateGlobalConfig
        }}>
            { children }
        </GlobalConfigContext.Provider>
    )
}

const useGlobalConfigContext = ()=> {
    try {
        const context = useContext(GlobalConfigContext);
        if (context === undefined) {
            throw new Error('An unhandled exception occured in useGlobalConfigContext');
        }
        return {...context} as GlobalConfigOptions
    } catch (err) {
        console.error(err)
        return {} as GlobalConfigOptions
    }
}

export {
    useGlobalConfigContext,
    GlobalConfigContextProvider
}