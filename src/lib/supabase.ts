import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://qxljnewdljpbfleriseu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bGpuZXdkbGpwYmZsZXJpc2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4Mzc4NjEsImV4cCI6MjA0OTQxMzg2MX0.BPuHXNKZ13PR9dhCxH3IntqjbH-5ZJfiNutyoFoZNeg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});