create extension if not exists "pgcrypto";

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email, telefone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'telefone', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'cliente')
  )
  on conflict (id) do update
  set
    nome = excluded.nome,
    email = excluded.email,
    telefone = excluded.telefone,
    role = excluded.role;

  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  email text not null unique,
  telefone text default '',
  role text not null default 'cliente' check (role in ('cliente', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.prestadores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null,
  tipo text not null,
  cidade text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.favoritos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  prestador_id uuid not null references public.prestadores (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, prestador_id)
);

create table if not exists public.chamados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  prestador_id uuid not null references public.prestadores (id) on delete cascade,
  problema text,
  detalhes text,
  localizacao text,
  prioridade text not null default 'normal' check (prioridade in ('alta', 'media', 'normal')),
  status text not null default 'Solicitado',
  created_at timestamptz not null default now()
);

create table if not exists public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  prestador_id uuid not null references public.prestadores (id) on delete cascade,
  usuario_nome text not null default '',
  nota int not null check (nota between 1 and 5),
  comentario text not null,
  created_at timestamptz not null default now()
);

alter table public.avaliacoes
add column if not exists usuario_nome text not null default '';

create table if not exists public.pacotes (
  id text primary key,
  nome text not null,
  preco numeric(10, 2) not null,
  periodo text not null default 'mensal',
  descricao text not null,
  max_chamados int not null
);

create table if not exists public.assinaturas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  pacote_id text not null references public.pacotes (id),
  data_inicio timestamptz not null,
  data_fim timestamptz not null,
  status text not null default 'ativo' check (status in ('ativo', 'expirado', 'cancelado')),
  chamados_usados int not null default 0
);

alter table public.profiles enable row level security;
alter table public.prestadores enable row level security;
alter table public.favoritos enable row level security;
alter table public.chamados enable row level security;
alter table public.avaliacoes enable row level security;
alter table public.assinaturas enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "prestadores_read_all" on public.prestadores;
create policy "prestadores_read_all"
on public.prestadores
for select
to anon, authenticated
using (true);

drop policy if exists "prestadores_admin_insert" on public.prestadores;
create policy "prestadores_admin_insert"
on public.prestadores
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

drop policy if exists "prestadores_admin_update" on public.prestadores;
create policy "prestadores_admin_update"
on public.prestadores
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

drop policy if exists "prestadores_admin_delete" on public.prestadores;
create policy "prestadores_admin_delete"
on public.prestadores
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

drop policy if exists "favoritos_manage_own" on public.favoritos;
create policy "favoritos_manage_own"
on public.favoritos
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "chamados_manage_own" on public.chamados;
create policy "chamados_manage_own"
on public.chamados
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "avaliacoes_read_all" on public.avaliacoes;
create policy "avaliacoes_read_all"
on public.avaliacoes
for select
to anon, authenticated
using (true);

drop policy if exists "avaliacoes_insert_own" on public.avaliacoes;
create policy "avaliacoes_insert_own"
on public.avaliacoes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "assinaturas_manage_own" on public.assinaturas;
create policy "assinaturas_manage_own"
on public.assinaturas
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.pacotes (id, nome, preco, periodo, descricao, max_chamados)
values
  ('pacote-basico', 'Pacote Basico', 29.90, 'mensal', '3 chamados de emergencia por mes com valores fixos', 3),
  ('pacote-premium', 'Pacote Premium', 49.90, 'mensal', 'Chamados ilimitados com beneficios exclusivos', -1)
on conflict (id) do update
set
  nome = excluded.nome,
  preco = excluded.preco,
  periodo = excluded.periodo,
  descricao = excluded.descricao,
  max_chamados = excluded.max_chamados;
