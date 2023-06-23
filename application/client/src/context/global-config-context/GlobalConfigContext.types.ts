import { AxiosError } from "axios";

export type ThemeOption = 'LIGHT' | 'DARK';
export type LayoutOption = 'GALLERY' | 'GRID' | 'LIST';
export type HealthStatus = boolean | AxiosError;
export type GlobalConfigOptions = {
    theme: ThemeOption;
    layout: LayoutOption;
    healthStatus: HealthStatus;
    updateGlobalConfig: ()=> void;
}
