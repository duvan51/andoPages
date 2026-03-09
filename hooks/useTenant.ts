import { useTenantContext } from '../context/TenantContext';

export type { Company } from '../context/TenantContext';

export const useTenant = () => {
    return useTenantContext();
};
