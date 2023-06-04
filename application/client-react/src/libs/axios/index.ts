import { setAxiosGlobalDefaults } from "./defaults";
import { setupAxiousInterceptors } from "./interceptors";

export const initAxiosInstance = ()=> {
    setAxiosGlobalDefaults();
    setupAxiousInterceptors();
}
