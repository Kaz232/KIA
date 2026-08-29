-- 1. Ativar Row Level Security nas tabelas principais
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas antigas permissivas
DROP POLICY IF EXISTS "Permitir tudo" ON public.profiles;
DROP POLICY IF EXISTS "Permitir tudo" ON public.leads;

-- 3. Regras para a tabela de Perfis (Profiles)
CREATE POLICY "Utilizador lê o próprio perfil"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Utilizador atualiza o próprio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- 4. Regras para a tabela de Leads (Acesso por Inquilino/Utilizador)
CREATE POLICY "Leitura de leads do próprio utilizador"
ON public.leads FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Inserção de leads associada ao próprio utilizador"
ON public.leads FOR INSERT
WITH CHECK (auth.uid() = user_id);
