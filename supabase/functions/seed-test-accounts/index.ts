import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TEST_ACCOUNTS = [
  { email: "patient@test.medicare.tn", password: "Test1234!", role: "patient", first_name: "Amine", last_name: "Ben Ali" },
  { email: "doctor@test.medicare.tn", password: "Test1234!", role: "doctor", first_name: "Ahmed", last_name: "Bouazizi" },
  { email: "pharmacy@test.medicare.tn", password: "Test1234!", role: "pharmacy", first_name: "Pharmacie", last_name: "El Amal" },
  { email: "lab@test.medicare.tn", password: "Test1234!", role: "laboratory", first_name: "Laboratoire", last_name: "BioLab" },
  { email: "secretary@test.medicare.tn", password: "Test1234!", role: "secretary", first_name: "Sonia", last_name: "Hamdi" },
  { email: "admin@test.medicare.tn", password: "Test1234!", role: "admin", first_name: "Admin", last_name: "Medicare" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results: { email: string; status: string; error?: string }[] = [];

    for (const account of TEST_ACCOUNTS) {
      try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            first_name: account.first_name,
            last_name: account.last_name,
            role: account.role,
          },
        });

        if (error) {
          // User might already exist
          if (error.message?.includes("already been registered")) {
            results.push({ email: account.email, status: "already_exists" });
          } else {
            results.push({ email: account.email, status: "error", error: error.message });
          }
        } else {
          results.push({ email: account.email, status: "created" });
        }
      } catch (err: any) {
        results.push({ email: account.email, status: "error", error: err.message });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
