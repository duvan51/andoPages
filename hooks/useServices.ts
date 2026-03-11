import { useState, useEffect, useCallback } from 'react';
import { Treatment } from '../constants/treatments';
import { Supplement } from '../constants/supplements';
import { supabase } from '../lib/supabase';
import { useTenant } from './useTenant';

export const useServices = () => {
    const { tenant } = useTenant();
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [supplements, setSupplements] = useState<Supplement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!tenant) return;

        try {
            setLoading(true);

            // Load treatments from Supabase filtered by company
            const { data: treatmentsData, error: treatmentsError } = await supabase
                .from('treatments')
                .select('*, benefits:treatment_benefits(benefit)')
                .eq('company_id', tenant.id);

            if (!treatmentsError && treatmentsData) {
                // Adapt the data structure to match the frontend expectations
                const formattedTreatments = treatmentsData.map(t => ({
                    ...t,
                    benefits: t.benefits?.map((b: any) => b.benefit) || []
                }));
                setTreatments(formattedTreatments);
            } else if (treatmentsError) {
                console.error('Error loading treatments from Supabase:', treatmentsError);
            }

            // Load supplements from Supabase filtered by company
            // Note: Assuming supplements table also has company_id
            const { data: supplementsData, error: supplementsError } = await supabase
                .from('supplements')
                .select('*, matchingTreatments:supplement_matching(treatment_id)')
                .eq('company_id', tenant.id);

            if (!supplementsError && supplementsData) {
                // Adapt the data structure to match the frontend expectations
                const formattedSupplements = supplementsData.map(s => ({
                    ...s,
                    matchingTreatments: s.matchingTreatments?.map((m: any) => m.treatment_id) || []
                }));
                setSupplements(formattedSupplements);
            } else if (supplementsError) {
                console.error('Error loading supplements from Supabase:', supplementsError);
            }

            setLoading(false);
        } catch (err: any) {
            console.error('Fetch error:', err);
            setError(err.message);
            setLoading(false);
        }
    }, [tenant]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { treatments, supplements, loading, error, refetch: fetchData };
};
