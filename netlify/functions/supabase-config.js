exports.handler = async function () {
  const url = process.env.SUPABASE_URL || 'https://bntnhtnwelviwlzhrttn.supabase.co';
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_gqrECGpAxOn1-XHnTe_D-A_aToekHFy';

  if (!url || !key) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ error: 'Supabase não configurado no Netlify.' })
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify({ url, key })
  };
};
