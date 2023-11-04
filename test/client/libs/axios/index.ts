import { setAxiosGlobalDefaults } from "./defaults";
import { setupAxiousInterceptors } from "./interceptors";

export const initAxiosInstance = ()=> {
    console.log(`Init: axios`);
    setAxiosGlobalDefaults();
    setupAxiousInterceptors();
}
