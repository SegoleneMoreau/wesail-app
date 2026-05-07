import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = 'https://tsidlzsaddfqpsygqeid.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzaWRsenNhZGRmcXBzeWdxZWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2OTQ1OTQsImV4cCI6MjA5MzI3MDU5NH0.D8nhucUVC5JQDd5i8Q9ekFIlJW6c_ZHHppsvT3msB14'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
