import { createClient } from './supabase/server.js';

export const getSupabase = () => {
    return createClient({
        getAll: () => [],
        set: () => {}
    });
};
