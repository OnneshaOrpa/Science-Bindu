
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qiloogoaynvbxnwabntf.supabase.co';
const supabaseKey = 'sb_publishable_fNaTQuAE7MqXn9SdSpqH1A_q_bLHYOs';

export const supabase = createClient(supabaseUrl, supabaseKey);
