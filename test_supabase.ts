import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL as string,
    process.env.VITE_SUPABASE_ANON_KEY as string
);

async function testUpdate() {
    // First login as admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'nantawudthn@nu.ac.th',
        password: 'password123' // Try default or dummy if we had one
    });

    if (authError) {
        console.log("Auth error, can't simulate:", authError.message);
        // Since we don't know the password, we can't fully simulate. Let's just try to update anonymously to see the RLS error.
    }

    // Attempt to update a user using anon key
    const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', 'febda3d3-4d03-4616-9034-2ae7a4c048fc')
        .select()
        .single();

    console.log("Update Data:", data);
    console.log("Update Error:", error);
}

testUpdate();
