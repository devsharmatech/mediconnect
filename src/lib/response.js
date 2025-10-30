import { corsHeaders } from "@/lib/cors";

export const success = (message, data = null, status = 200) =>
  new Response(
    JSON.stringify({ success: true, message, data }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    }
  );

export const failure = (message, error = null, status = 400) =>
  new Response(
    JSON.stringify({ success: false, message, error }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    }
  );
