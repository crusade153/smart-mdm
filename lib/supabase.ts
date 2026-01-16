// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// RLS를 껐으므로, 일반 Anon Key로도 모든 읽기/쓰기가 가능합니다.
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; 

export const supabase = createClient(supabaseUrl, supabaseKey);