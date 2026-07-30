// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Debug: Log what you have
console.log('🔍 Supabase URL:', supabaseUrl);
console.log('🔍 Supabase Anon Key:', supabaseAnonKey ? '✅ Found' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please check your .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing connection to:', supabaseUrl);
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connected successfully!');
    console.log('📊 Data:', data);
    return true;
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error);
    console.error('💡 Error details:', {
      message: error.message,
      name: error.name,
      cause: error.cause
    });
    return false;
  }
};