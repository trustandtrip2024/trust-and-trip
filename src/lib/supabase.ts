import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type LeadSource =
  // Full-form submissions (name + phone required)
  | "package_enquiry"
  | "contact_form"
  | "trip_planner"
  | "exit_intent"
  | "newsletter"
  | "itinerary_generator"
  | "whatsapp"
  // Anonymous click-intent sources (no contact info required — fired on CTA clicks)
  | "book_now_click"
  | "call_click"
  | "whatsapp_click"
  | "customize_click"
  | "enquire_click"
  | "schedule_call_click";

export interface Lead {
  id?: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  package_title?: string;
  package_slug?: string;
  destination?: string;
  travel_type?: string;
  travel_date?: string;
  num_travellers?: string;
  budget?: string;
  source: LeadSource;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  wa_variant?: string;
  page_url?: string;
  ref_code?: string;
  status?: "new" | "contacted" | "qualified" | "booked" | "lost";
  created_at?: string;
}
