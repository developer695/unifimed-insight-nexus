// hooks/useExistingRules.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useExistingRules() {
    const [hasExistingRules, setHasExistingRules] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkExistingRules = async () => {
        setLoading(true);
        setError(null);
        try {
            // Check if rules table has any data
            const { data: rulesData, error: rulesError } = await supabase
                .from("rules")
                .select("id")
                .limit(1);

            // Check if rag_rules table has any data
            const { data: ragRulesData, error: ragRulesError } = await supabase
                .from("rag_rules")
                .select("id")
                .limit(1);

            if (rulesError || ragRulesError) {
                throw new Error(rulesError?.message || ragRulesError?.message);
            }

            const hasRules = (rulesData && rulesData.length > 0) ||
                (ragRulesData && ragRulesData.length > 0);
            setHasExistingRules(hasRules);

        } catch (err) {
            setError(err.message);
            console.error('Error checking existing rules:', err);
        } finally {
            setLoading(false);
        }
    };

    // Re-check function
    const refresh = () => {
        checkExistingRules();
    };

    // Initial check on mount
    useEffect(() => {
        checkExistingRules();
    }, []);

    return {
        hasExistingRules,
        loading,
        error,
        refresh
    };
}