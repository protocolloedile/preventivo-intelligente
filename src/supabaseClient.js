import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tahstkmfjiktnvlkcxfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhaHN0a21mamlrdG52bGtjeGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTcxNjEsImV4cCI6MjA5MDM3MzE2MX0.gw07avoSt5ccSGS0gpNTBimlUdreJLQsBiazYRidfRY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
