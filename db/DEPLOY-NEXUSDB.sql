-- ═══════════════════════════════════════════════════════════════════════════
-- Catálogo Sowa → nexusdb (Postgres do USFORCE)
-- Rodar no CONSOLE SQL do USFORCE (Admin → Sistema → Console SQL), banco nexus.
-- Cria um schema ISOLADO `catalogo` — não toca em nada que já existe no nexusdb.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE SCHEMA IF NOT EXISTS catalogo;

CREATE TABLE IF NOT EXISTS catalogo.holdings (
  id         text PRIMARY KEY,
  name       text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalogo.companies (
  slug       text PRIMARY KEY,
  name       text NOT NULL,
  tagline    text,
  accent     text DEFAULT '#0F1B3D',
  holding_id text NOT NULL REFERENCES catalogo.holdings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalogo.brands (
  slug         text PRIMARY KEY,
  name         text NOT NULL,
  tagline      text,
  accent       text DEFAULT '#0F1B3D',
  company_slug text NOT NULL REFERENCES catalogo.companies(slug) ON DELETE CASCADE,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalogo.categories (
  id          serial PRIMARY KEY,
  entity_slug text NOT NULL,
  name        text NOT NULL,
  accent      text,
  UNIQUE (entity_slug, name)
);

CREATE TABLE IF NOT EXISTS catalogo.products (
  id            text PRIMARY KEY,
  company_slug  text NOT NULL,
  category      text NOT NULL,
  name          text NOT NULL,
  code          text,
  short         text,
  long          text,
  units_per_box integer DEFAULT 1,
  origin        text DEFAULT 'Brasil',
  active        boolean DEFAULT true,
  shared_with   text[] DEFAULT '{}',
  images        text[] DEFAULT '{}',
  created_at    date DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_cat_products_company  ON catalogo.products(company_slug);
CREATE INDEX IF NOT EXISTS idx_cat_products_active   ON catalogo.products(active);
CREATE INDEX IF NOT EXISTS idx_cat_categories_entity ON catalogo.categories(entity_slug);

CREATE TABLE IF NOT EXISTS catalogo.catalog_configs (
  entity_slug          text PRIMARY KEY,
  cover_url            text,
  back_cover_url       text,
  template             text DEFAULT 'moderno',
  show_category_covers boolean DEFAULT true,
  show_brand_dividers  boolean DEFAULT true,
  layout               jsonb,
  updated_at           timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalogo.entity_logos (
  entity_slug text PRIMARY KEY,
  logo_url    text,
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalogo.category_covers (
  id            serial PRIMARY KEY,
  entity_slug   text NOT NULL,
  category_name text NOT NULL,
  cover_url     text,
  UNIQUE (entity_slug, category_name)
);

-- Conferência:
-- SELECT table_name FROM information_schema.tables WHERE table_schema='catalogo';
