-- Execute no SQL Editor do Supabase antes de usar a versão com login.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nome text,
  role text not null default 'usuario' check (role in ('usuario','coordenador')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
grant select on public.profiles to authenticated;
drop policy if exists "usuario consulta o proprio perfil" on public.profiles;
create policy "usuario consulta o proprio perfil" on public.profiles for select to authenticated using (id = auth.uid());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id,email,nome,role)
  values (new.id,new.email,coalesce(new.raw_user_meta_data->>'name',''),'usuario')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table if not exists public.historico_faturamento (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  nome_arquivo text not null,
  total numeric(14,2) not null default 0,
  total_rotas integer not null default 0,
  dados jsonb not null
);
alter table public.historico_faturamento add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
create index if not exists historico_faturamento_created_at_idx on public.historico_faturamento (created_at desc);
alter table public.historico_faturamento enable row level security;
revoke all on public.historico_faturamento from anon;
grant select,insert on public.historico_faturamento to authenticated;
drop policy if exists "dashboard pode salvar historico" on public.historico_faturamento;
drop policy if exists "dashboard pode consultar historico" on public.historico_faturamento;
drop policy if exists "usuario salva o proprio historico" on public.historico_faturamento;
drop policy if exists "usuario consulta o proprio historico" on public.historico_faturamento;
create policy "usuario salva o proprio historico" on public.historico_faturamento for insert to authenticated with check (user_id = auth.uid());
create policy "usuario consulta o proprio historico" on public.historico_faturamento for select to authenticated using (user_id = auth.uid());

-- Depois de criar edinanmag@gmail.com em Authentication > Users, execute novamente este bloco:
insert into public.profiles (id,email,nome,role)
select id,email,'Edinan Magalhães','coordenador' from auth.users where lower(email)=lower('edinanmag@gmail.com')
on conflict (id) do update set nome=excluded.nome, role='coordenador';
