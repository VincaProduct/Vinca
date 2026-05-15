import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory token cache (per Edge Function instance lifetime)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getZohoBookingsToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const clientId     = Deno.env.get('ZOHO_BOOKINGS_CLIENT_ID')!;
  const clientSecret = Deno.env.get('ZOHO_BOOKINGS_CLIENT_SECRET')!;
  const refreshToken = Deno.env.get('ZOHO_BOOKINGS_REFRESH_TOKEN')!;

  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id:     clientId,
    client_secret: clientSecret,
    grant_type:    'refresh_token',
  });

  const res = await fetch('https://accounts.zoho.in/oauth/v2/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zoho token refresh failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  if (!data.access_token) throw new Error(`No access_token in response: ${JSON.stringify(data)}`);

  cachedToken = { token: data.access_token, expiresAt: Date.now() + 55 * 60 * 1000 };
  return data.access_token;
}

// "9:00 AM" → "09:00:00", "2:00 PM" → "14:00:00"
function slotTo24h(slot: string): string {
  const [time, mer] = slot.trim().split(' ');
  let [h, m] = time.split(':').map(Number);
  if (mer === 'PM' && h !== 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

// "2026-05-23" → "23-May-2026"
function isoToZohoDate(iso: string): string {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const [yr, mo, dy] = iso.split('-');
  return `${dy}-${MONTHS[parseInt(mo) - 1]}-${yr}`;
}

// Add minutes to "HH:mm:ss" and return new "HH:mm:ss"
function addMinutes(time24: string, mins: number): string {
  const [h, m, s] = time24.split(':').map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const {
      preferred_date,   // "2026-05-23"
      preferred_time_slot, // "9:00 AM"
      full_name,
      email,
      phone,
    } = await req.json();

    if (!preferred_date || !preferred_time_slot || !email || !full_name) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const zohoDate  = isoToZohoDate(preferred_date);
    const time24    = slotTo24h(preferred_time_slot);
    const endTime24 = addMinutes(time24, 30); // 30-minute consultation

    const fromTime = `${zohoDate} ${time24}`;
    const toTime   = `${zohoDate} ${endTime24}`;

    const accessToken = await getZohoBookingsToken();

    const payload = {
      service_id: Deno.env.get('ZOHO_BOOKINGS_SERVICE_ID') || '182381000001291158',
      staff_id:   Deno.env.get('ZOHO_BOOKINGS_STAFF_ID')   || '182381000000028008',
      from_time:  fromTime,
      to_time:    toTime,
      timezone:   'Asia/Calcutta',
      customer_details: {
        name:         full_name,
        email:        email,
        phone_number: phone || '',
      },
    };

    console.log('Creating Zoho Booking:', JSON.stringify(payload));

    const zohoRes = await fetch('https://www.zohoapis.in/bookings/v1/json/appointment', {
      method:  'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(payload),
    });

    const zohoData = await zohoRes.json();
    console.log('Zoho Bookings response:', JSON.stringify(zohoData));

    if (!zohoRes.ok || zohoData.response?.returnvalue?.status === 'failure') {
      const msg = zohoData.response?.returnvalue?.message || zohoData.message || 'Zoho Bookings error';
      return new Response(
        JSON.stringify({ success: false, error: msg, raw: zohoData }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: zohoData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('zoho-booking error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
