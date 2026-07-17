exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido.' }) };
  const url = process.env.SUPABASE_URL || '';
  const publishable = process.env.SUPABASE_PUBLISHABLE_KEY || '';
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const token = (event.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const json = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) });
  if (!url || !publishable || !serviceRole) return json(503, { error: 'Variáveis do Supabase incompletas no Netlify.' });
  if (!token) return json(401, { error: 'Sessão não informada.' });

  const userRes = await fetch(`${url}/auth/v1/user`, { headers: { apikey: publishable, Authorization: `Bearer ${token}` } });
  if (!userRes.ok) return json(401, { error: 'Sessão inválida ou expirada.' });
  const currentUser = await userRes.json();
  const adminHeaders = { apikey: serviceRole, Authorization: `Bearer ${serviceRole}`, 'Content-Type': 'application/json' };
  const profileRes = await fetch(`${url}/rest/v1/profiles?select=role&id=eq.${encodeURIComponent(currentUser.id)}&limit=1`, { headers: adminHeaders });
  const profiles = profileRes.ok ? await profileRes.json() : [];
  if (profiles[0]?.role !== 'coordenador') return json(403, { error: 'Somente coordenadores podem cadastrar usuários.' });

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Dados inválidos.' }); }
  const name = String(body.name || '').trim(), email = String(body.email || '').trim().toLowerCase(), password = String(body.password || ''), role = body.role === 'coordenador' ? 'coordenador' : 'usuario';
  if (!name || !email || password.length < 8) return json(400, { error: 'Informe nome, e-mail e senha com pelo menos 8 caracteres.' });

  const createRes = await fetch(`${url}/auth/v1/admin/users`, { method: 'POST', headers: adminHeaders, body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { name } }) });
  const created = await createRes.json();
  if (!createRes.ok) return json(createRes.status, { error: created.msg || created.message || 'Não foi possível criar o usuário.' });
  const profileWrite = await fetch(`${url}/rest/v1/profiles?on_conflict=id`, { method: 'POST', headers: { ...adminHeaders, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ id: created.id, email, nome: name, role }) });
  if (!profileWrite.ok) {
    await fetch(`${url}/auth/v1/admin/users/${created.id}`, { method: 'DELETE', headers: adminHeaders });
    return json(500, { error: 'Não foi possível atribuir o perfil ao usuário.' });
  }
  return json(201, { id: created.id, email, role });
};
