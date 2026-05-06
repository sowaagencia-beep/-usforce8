-- ═══════════════════════════════════════════════════════════════
-- USFORCE8 — Seed (dados iniciais)
-- Execute DEPOIS do schema.sql
-- ═══════════════════════════════════════════════════════════════

-- Holdings
INSERT INTO holdings (id, name) VALUES
  ('group9',  'Group 9'),
  ('opolski', 'Opolski Participações')
ON CONFLICT (id) DO NOTHING;

-- Empresas
INSERT INTO companies (slug, name, tagline, accent, holding_id) VALUES
  ('av09',       'AV09',       'Comércio Exterior',       '#1E5BC6', 'group9'),
  ('sulfoods',   'Sulfoods',   'Indústria de Alimentos',  '#B23A3A', 'opolski'),
  ('fxamerica',  'FX America', 'Grupo Empresarial',       '#5A3DAA', 'opolski'),
  ('dcfoods',    'DCFoods',    'Distribuição Premium',    '#C68A1E', 'opolski'),
  ('oceanfoods', 'OceanFoods', 'Frutos do Oceano',        '#0E8080', 'opolski')
ON CONFLICT (slug) DO NOTHING;

-- Marcas
INSERT INTO brands (slug, name, tagline, accent, company_slug) VALUES
  ('ninefish',     'Ninefish',     'Pescados Premium',       '#1E5BC6', 'av09'),
  ('ninefoods',    'Ninefoods',    'Alimentos Selecionados', '#2A7A4A', 'av09'),
  ('peixe-fresco', 'Peixe Fresco', 'Mar para a Mesa',        '#0E7C8C', 'av09'),
  ('legour',       'Legour',       'Confeitaria Fina',       '#8B5E3C', 'sulfoods'),
  ('sevenfish',    'Sevenfish',    'Frutos do Mar',          '#1F6F9C', 'fxamerica'),
  ('7ecom',        '7E-COM',       'Marketplace Digital',    '#5A3DAA', 'fxamerica')
ON CONFLICT (slug) DO NOTHING;

-- Categorias
INSERT INTO categories (entity_slug, name) VALUES
  ('ninefish',     'Frescos'),    ('ninefish',     'Congelados'), ('ninefish',     'Defumados'), ('ninefish',     'Conservas'),
  ('ninefoods',    'Grãos'),      ('ninefoods',    'Massas'),     ('ninefoods',    'Conservas'), ('ninefoods',    'Orgânicos'),
  ('peixe-fresco', 'Peixes'),     ('peixe-fresco', 'Frutos do Mar'), ('peixe-fresco', 'Filés'), ('peixe-fresco', 'Inteiros'),
  ('sulfoods',     'Carnes'),     ('sulfoods',     'Embutidos'),  ('sulfoods',     'Laticínios'), ('sulfoods',    'Pratos Prontos'),
  ('legour',       'Doces'),      ('legour',       'Chocolates'), ('legour',       'Biscoitos'), ('legour',       'Bolos'),
  ('sevenfish',    'Frescos'),    ('sevenfish',    'Congelados'), ('sevenfish',    'Sushi Grade'), ('sevenfish',  'Pré-Preparados'),
  ('7ecom',        'Eletrônicos'), ('7ecom',       'Casa e Decoração'), ('7ecom',  'Ferramentas'), ('7ecom',     'Esporte'),
  ('dcfoods',      'Bebidas'),    ('dcfoods',      'Mercearia'),  ('dcfoods',      'Higiene'),    ('dcfoods',     'Limpeza'),
  ('oceanfoods',   'Frescos'),    ('oceanfoods',   'Congelados'), ('oceanfoods',   'Importados')
ON CONFLICT (entity_slug, name) DO NOTHING;

-- Produtos (20 produtos de demonstração)
INSERT INTO products (id, company_slug, category, name, code, short, long, units_per_box, origin, active, shared_with, images, created_at) VALUES
  ('PRD-1001','ninefish','Frescos','Salmão Fresco Premium','USF-1001','Filé selecionado, captura responsável.','Filé de salmão fresco selecionado, sem espinhas, com gordura nobre marmorizada. Captura sustentável certificada.',6,'Chile',true,'{}','{}','2026-04-28'),
  ('PRD-1002','ninefish','Congelados','Atum Yellowfin Saku','USF-1002','Bloco premium para sashimi.','Bloco de atum yellowfin congelado a bordo. Padrão exportação Japão.',12,'Brasil',true,'{}','{}','2026-05-01'),
  ('PRD-1003','ninefish','Defumados','Salmão Defumado a Frio','USF-1003','Defumação artesanal lenta.','Defumação a frio com madeira nobre, fatiado fino, embalagem a vácuo.',24,'Noruega',true,'{}','{}','2026-04-12'),
  ('PRD-1004','ninefoods','Grãos','Arroz Arbório Risoto','USF-1004','Grão curto italiano premium.','Arroz arbório itália para risoto cremoso. Pacote de 1kg.',20,'Itália',true,'{}','{}','2026-04-22'),
  ('PRD-1005','ninefoods','Conservas','Tomate Pelado San Marzano','USF-1005','DOP italiano em lata.','Tomate pelado San Marzano DOP, colheita manual, ideal para molhos.',24,'Itália',true,'{}','{}','2026-04-30'),
  ('PRD-1006','ninefoods','Orgânicos','Quinoa Orgânica Andes','USF-1006','Selo orgânico certificado.','Quinoa orgânica de altitude, três variedades misturadas.',30,'Peru',true,'{}','{}','2026-04-15'),
  ('PRD-1007','peixe-fresco','Inteiros','Robalo Inteiro Selvagem','USF-1007','Pesca artesanal do litoral SC.','Robalo selvagem inteiro, eviscerado, gelo escamado, rastreabilidade total.',4,'Brasil',true,'{}','{}','2026-05-02'),
  ('PRD-1008','peixe-fresco','Filés','Filé de Linguado','USF-1008','Corte branco delicado.','Filé de linguado fresco, sem pele, sem espinhas, padrão executivo.',10,'Brasil',true,'{}','{}','2026-04-29'),
  ('PRD-1009','peixe-fresco','Frutos do Mar','Camarão Rosa Graúdo','USF-1009','VG10/15 selecionado.','Camarão rosa graúdo, classificação VG10/15, descabeçado, congelado individual.',8,'Brasil',true,'{}','{}','2026-04-18'),
  ('PRD-1010','sulfoods','Embutidos','Salame Italiano Curado 90 Dias','USF-1010','Maturação lenta artesanal.','Salame italiano curado naturalmente por 90 dias, receita familiar.',12,'Brasil',true,'{}','{}','2026-04-25'),
  ('PRD-1011','sulfoods','Carnes','Picanha Black Angus','USF-1011','Maturação úmida 21 dias.','Picanha Black Angus com maturação úmida, peça a vácuo.',6,'Argentina',true,'{}','{}','2026-05-03'),
  ('PRD-1012','legour','Chocolates','Tablete Cacau 70% Origem Única','USF-1012','Origem Bahia, conchagem 72h.','Chocolate amargo 70% cacau de origem única, conchagem prolongada.',24,'Brasil',true,'{}','{}','2026-04-20'),
  ('PRD-1013','legour','Biscoitos','Amaretti Toscano Tradicional','USF-1013','Receita italiana com amêndoa.','Biscoito amaretti tradicional toscano, embalagem rígida 200g.',18,'Itália',true,'{}','{}','2026-04-10'),
  ('PRD-1014','7ecom','Eletrônicos','Smart TV 55 polegadas 4K HDR','USF-1014','Painel IPS com Dolby Vision.','Smart TV 55" 4K UHD com HDR10+ e Dolby Vision, sistema operacional integrado.',2,'China',true,'{}','{}','2026-04-26'),
  ('PRD-1015','7ecom','Ferramentas','Furadeira de Impacto 750W','USF-1015','Mandril 13mm com maleta.','Furadeira de impacto 750W com mandril de 13mm, velocidade variável, maleta.',6,'Brasil',true,'{}','{}','2026-04-21'),
  ('PRD-1016','7ecom','Casa e Decoração','Cafeteira Espresso Manual','USF-1016','Bomba 15 bar profissional.','Cafeteira espresso manual com bomba italiana de 15 bar, vaporizador.',4,'Itália',true,'{}','{}','2026-04-19'),
  ('PRD-1017','sevenfish','Sushi Grade','Atum Bluefin Cubo Premium','USF-1017','Akami AAA padrão sushi.','Cubo de atum bluefin AAA, congelado ultra-rápido, padrão sushi premium.',8,'Espanha',true,'{}','{}','2026-05-01'),
  ('PRD-1018','sevenfish','Frescos','Polvo Patagônico','USF-1018','Tentáculos limpos e tenros.','Polvo da Patagônia limpo, tenro, ideal para grelha ou carpaccio.',6,'Argentina',true,'{}','{}','2026-04-27'),
  ('PRD-1019','dcfoods','Bebidas','Azeite Extra Virgem Andaluz','USF-1019','Acidez < 0,3% colheita 2025.','Azeite extra virgem andaluz de primeira pressão a frio, garrafa 500ml.',12,'Espanha',true,'{}','{}','2026-04-14'),
  ('PRD-1020','dcfoods','Mercearia','Açafrão Espanhol em Fios','USF-1020','Categoria Coupé I.','Açafrão espanhol em fios, categoria Coupé I, frasco 1g lacrado.',60,'Espanha',true,'{}','{}','2026-04-08')
ON CONFLICT (id) DO NOTHING;
