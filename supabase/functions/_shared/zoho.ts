// Zoho CRM API utilities

interface ZohoTokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: ZohoTokenCache | null = null;

/**
 * Get Zoho OAuth access token using refresh token
 * Tokens are cached for 55 minutes to minimize API calls
 */
export async function getZohoAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const clientId = Deno.env.get('ZOHO_CLIENT_ID');
  const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');
  const refreshToken = Deno.env.get('ZOHO_REFRESH_TOKEN');
  const apiDomain = Deno.env.get('ZOHO_API_DOMAIN') || 'https://www.zohoapis.in';

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Zoho credentials in environment variables');
  }

  // Convert API domain to accounts domain
  // e.g., https://www.zohoapis.in -> https://accounts.zoho.in
  const accountsDomain = apiDomain.replace('www.zohoapis', 'accounts.zoho');

  const tokenUrl = `${accountsDomain}/oauth/v2/token`;
  
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  });

  console.log('Requesting Zoho access token from:', tokenUrl);

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Zoho token request failed:', response.status, errorText);
    throw new Error(`Failed to get Zoho access token: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.access_token) {
    console.error('No access token in response:', data);
    throw new Error('No access token returned from Zoho');
  }

  // Cache token for 55 minutes (tokens valid for 1 hour)
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (55 * 60 * 1000),
  };

  return data.access_token;
}

/**
 * Make authenticated request to Zoho CRM API
 */
export async function zohoRequest(
  method: string,
  endpoint: string,
  body?: any
): Promise<any> {
  const accessToken = await getZohoAccessToken();
  const apiDomain = Deno.env.get('ZOHO_API_DOMAIN') || 'https://www.zohoapis.in';

  const url = `${apiDomain}/crm/v8/${endpoint}`;
  
  const headers = {
    'Authorization': `Zoho-oauthtoken ${accessToken}`,
    'Content-Type': 'application/json',
  };

  console.log(`Making Zoho API request: ${method} ${url}`);

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  const responseData = await response.json();

  if (!response.ok) {
    console.error('Zoho API request failed:', response.status, responseData);
    throw new Error(`Zoho API error: ${JSON.stringify(responseData)}`);
  }

  return responseData;
}
