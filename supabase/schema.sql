-- ═══════════════════════════════════════════════════════════════
-- USFORCE8 — Schema Supabase
-- Cole este SQL no SQL Editor do seu projeto Supabase
-- Painel: https://supabase.com/dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- ── Holdings ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS holdings (
  id         text PRIMARY KEY,
  name       text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ── Empresas ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  slug       text PRIMARY KEY,
  name       text NOT NULL,
  tagline    text,
  accent     text DEFAULT '#0F1B3D',
  holding_id text NOT NULL REFERENCES holdings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- ── Marcas ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brands (
  slug         text PRIMARY KEY,
  name         text NOT NULL,
  tagline      text,
  accent       text DEFAULT '#0F1B3D',
  company_slug text NOT NULL REFERENCES companies(slug) ON DELETE CASCADE,
  created_at   timestamptz DEFAULT now()
);

-- ── Categorias ────────────────────────────────────────────────────────────────
-- entity_slug pode ser slug de empresa OU marca
CREATE TABLE IF NOT EXISTS categories (
  id          serial PRIMARY KEY,
  entity_slug text NOT NULL,
  name        text NOT NULL,
  UNIQUE (entity_slug, name)
);

-- ── Produtos ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            text PRIMARY KEY,
  company_slug  text NOT NULL,        -- slug da empresa ou marca proprietária
  category      text NOT NULL,
  name          text NOT NULL,
  code          text,
  short         text,
  long          text,
  units_per_box integer DEFAULT 1,
  origin        text DEFAULT 'Brasil',
  active        boolean DEFAULT true,
  shared_with   text[]  DEFAULT '{}', -- slugs de outras entidades
  images        text[]  DEFAULT '{}', -- URLs Dropbox
  created_at    date    DEFAULT CURRENT_DATE
);

-- ── Índices ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_company_slug  ON products(company_slug);
CREATE INDEX IF NOT EXISTS idx_products_active        ON products(active);
CREATE INDEX IF NOT EXISTS idx_categories_entity_slug ON categories(entity_slug);
CREATE INDEX IF NOT EXISTS idx_companies_holding_id   ON companies(holding_id);
CREATE INDEX IF NOT EXISTS idx_brands_company_slug    ON brands(company_slug);

-- ── Configurações de Catálogo ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_configs (
  entity_slug           text PRIMARY KEY,
  cover_url             text,
  back_cover_url        text,
  template              text    DEFAULT 'moderno',
  show_category_covers  boolean DEFAULT true,
  show_brand_dividers   boolean DEFAULT true,
  updated_at            timestamptz DEFAULT now()
);
-- Adiciona colunas novas se a tabela já existia
ALTER TABLE catalog_configs ADD COLUMN IF NOT EXISTS back_cover_url       text;
ALTER TABLE catalog_configs ADD COLUMN IF NOT EXISTS show_category_covers boolean DEFAULT true;
ALTER TABLE catalog_configs ADD COLUMN IF NOT EXISTS show_brand_dividers  boolean DEFAULT true;

-- ── Portadas de Categorias ────────────────────────────────────────────────────
-- Imagem separadora por categoria dentro de um catálogo
CREATE TABLE IF NOT EXISTS category_covers (
  id            serial PRIMARY KEY,
  entity_slug   text NOT NULL,
  category_name text NOT NULL,
  cover_url     text,
  UNIQUE (entity_slug, category_name)
);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE holdings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands          ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_covers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='holdings'        AND policyname='public_all') THEN CREATE POLICY "public_all" ON holdings        FOR ALL USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='companies'       AND policyname='public_all') THEN CREATE POLICY "public_all" ON companies       FOR ALL USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='brands'          AND policyname='public_all') THEN CREATE POLICY "public_all" ON brands          FOR ALL USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='categories'      AND policyname='public_all') THEN CREATE POLICY "public_all" ON categories      FOR ALL USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products'        AND policyname='public_all') THEN CREATE POLICY "public_all" ON products        FOR ALL USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='catalog_configs' AND policyname='public_all') THEN CREATE POLICY "public_all" ON catalog_configs FOR ALL USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='category_covers' AND policyname='public_all') THEN CREATE POLICY "public_all" ON category_covers FOR ALL USING (true) WITH CHECK (true); END IF;
END $$;
