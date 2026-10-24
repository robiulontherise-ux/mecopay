import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || 'https://fwonuakvherzofqximno.supabase.co';
export const supabaseAnonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MzA5MDEsImV4cCI6MjEwMDQwNjkwMX0.29mIqf8zwUczPXIfIILw6ybJRKJ_l8HUttNU-6s-cL0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

