import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Check apps/web-app/.env.local')
}

// Fallback for storage if localStorage is not accessible
const isLocalStorageAvailable = () => {
    try {
        const test = '__storage_test__'
        window.localStorage.setItem(test, test)
        window.localStorage.removeItem(test)
        return true
    } catch (e) {
        return false
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        storage: isLocalStorageAvailable() ? window.localStorage : undefined,
        detectSessionInUrl: true,
        autoRefreshToken: true,
    }
})
