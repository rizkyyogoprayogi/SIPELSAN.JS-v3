import { supabase } from './supabaseClient'

export const logActivity = async (userId, aksi, entitas, keterangan) => {
    try {
        if (!userId) return

        const { error } = await supabase
            .from('log_aktivitas')
            .insert([{
                user_id: userId,
                aksi,
                entitas,
                keterangan
            }])

        if (error) {
            console.error('Failed to log activity:', error)
        }
    } catch (err) {
        console.error('Log activity exception:', err)
    }
}
