import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [configError, setConfigError] = useState(false)

    useEffect(() => {
        // Check for missing config first
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            setConfigError(true)
            setLoading(false)
            return
        }

        // Get initial session
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                setUser(session?.user ?? null)
                if (session?.user) {
                    await fetchProfile(session.user.id)
                }
            } catch (error) {
                console.error('Error getting session:', error)
                setConfigError(true)
            } finally {
                setLoading(false)
            }
        }

        getSession()

        // Listen for auth changes
        let subscription = null
        try {
            const { data } = supabase.auth.onAuthStateChange(
                async (event, session) => {
                    setUser(session?.user ?? null)
                    if (session?.user) {
                        await fetchProfile(session.user.id)
                    } else {
                        setProfile(null)
                    }
                    setLoading(false)
                }
            )
            subscription = data?.subscription
        } catch (error) {
            console.error('Error setting up auth listener:', error)
        }

        return () => subscription?.unsubscribe()
    }, [])

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            setProfile(data)
        } catch (error) {
            console.error('Error fetching profile:', error)
            setProfile(null)
        }
    }

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) throw error
        return data
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setUser(null)
        setProfile(null)
    }

    const value = {
        user,
        profile,
        loading,
        configError,
        signIn,
        signOut,
        isAdmin: profile?.role === 'admin',
        isMusyrifah: profile?.role === 'musyrifah',
        isPimpinan: profile?.role === 'pimpinan',
        canInput: profile?.role === 'admin' || profile?.role === 'musyrifah',
        canManage: profile?.role === 'admin'
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext
