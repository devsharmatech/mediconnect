import { createClient } from '@supabase/supabase-js'
import OpenAI from "openai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});