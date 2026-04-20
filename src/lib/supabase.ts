import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type LeadSource = "package_enquiry" | "contact_form" | "trip_planner" | "exit_intent" | "newsletter";

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
  page_url?: string;
  status?: "new" | "contacted" | "qualified" | "booked" | "lost";
  created_at?: string;
}
