import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qxwqfcnkyysznuuwxins.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4d3FmY25reXlzem51dXd4aW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NTgyNDMsImV4cCI6MjA2NzMzNDI0M30.70zLW-Am3z5geVFYi7NXGW9qCgae_1nMqUjV0B_oaDc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
