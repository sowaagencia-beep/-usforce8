// Dados mockados USFORCE8 — hierarquia 3 níveis: Holding → Empresa → Marca

(function () {
  const HOLDINGS = [
    {
      id: 'group9',
      name: 'Group 9',
      companies: [
        {
          slug: 'av09',
          name: 'AV09',
          tagline: 'Comércio Exterior',
          accent: '#1E5BC6',
          brands: [
            { slug: 'ninefish',     name: 'Ninefish',     tagline: 'Pescados Premium',       accent: '#1E5BC6' },
            { slug: 'ninefoods',    name: 'Ninefoods',    tagline: 'Alimentos Selecionados', accent: '#2A7A4A' },
            { slug: 'peixe-fresco', name: 'Peixe Fresco', tagline: 'Mar para a Mesa',        accent: '#0E7C8C' },
          ],
        },
      ],
    },
    {
      id: 'opolski',
      name: 'Opolski Participações',
      companies: [
        {
          slug: 'sulfoods',
          name: 'Sulfoods',
          tagline: 'Indústria de Alimentos',
          accent: '#B23A3A',
          brands: [
            { slug: 'legour', name: 'Legour', tagline: 'Confeitaria Fina', accent: '#8B5E3C' },
          ],
        },
        {
          slug: 'fxamerica',
          name: 'FX America',
          tagline: 'Grupo Empresarial',
          accent: '#5A3DAA',
          brands: [
            { slug: 'sevenfish', name: 'Sevenfish', tagline: 'Frutos do Mar',       accent: '#1F6F9C' },
            { slug: '7ecom',     name: '7E-COM',    tagline: 'Marketplace Digital', accent: '#5A3DAA' },
          ],
        },
        {
          slug: 'dcfoods',
          name: 'DCFoods',
          tagline: 'Distribuição Premium',
          accent: '#C68A1E',
          brands: [],
        },
        {
          slug: 'oceanfoods',
          name: 'OceanFoods',
          tagline: 'Frutos do Oceano',
          accent: '#0E8080',
          brands: [],
        },
      ],
    },
  ];

  const CATEGORIES = {
    'av09':         [],
    'ninefish':     ['Frescos', 'Congelados', 'Defumados', 'Conservas'],
    'ninefoods':    ['Grãos', 'Massas', 'Conservas', 'Orgânicos'],
    'peixe-fresco': ['Peixes', 'Frutos do Mar', 'Filés', 'Inteiros'],
    'sulfoods':     ['Carnes', 'Embutidos', 'Laticínios', 'Pratos Prontos'],
    'legour':       ['Doces', 'Chocolates', 'Biscoitos', 'Bolos'],
    'fxamerica':    [],
    'sevenfish':    ['Frescos', 'Congelados', 'Sushi Grade', 'Pré-Preparados'],
    '7ecom':        ['Eletrônicos', 'Casa e Decoração', 'Ferramentas', 'Esporte'],
    'dcfoods':      ['Bebidas', 'Mercearia', 'Higiene', 'Limpeza'],
    'oceanfoods':   ['Frescos', 'Congelados', 'Importados'],
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────

  // Builds a flat { slug → entity } map covering all companies AND brands.
  // Each entry includes: type ('company'|'brand'), holdingId, holdingName,
  // parentSlug (brand's company slug, null for companies), parentName.
  function buildEntityMap(holdings) {
    const map = {};
    holdings.forEach(h => {
      h.companies.forEach(c => {
        map[c.slug] = { ...c, type: 'company', holdingId: h.id, holdingName: h.name, parentSlug: null, parentName: null };
        (c.brands || []).forEach(b => {
          map[b.slug] = { ...b, type: 'brand', holdingId: h.id, holdingName: h.name, parentSlug: c.slug, parentName: c.name };
        });
      });
    });
    return map;
  }

  // Returns all slugs that should be visible in a given entity's vitrina.
  //   • Company with brands → [company_slug, brand1, brand2, ...]
  //   • Brand / Company without brands → [slug]
  function getSlugsUnder(slug, holdings) {
    for (const h of holdings) {
      for (const c of h.companies) {
        if (c.slug === slug) {
          return [slug, ...(c.brands || []).map(b => b.slug)];
        }
        for (const b of (c.brands || [])) {
          if (b.slug === slug) return [slug];
        }
      }
    }
    return [slug];
  }

  // Returns a flat list of all entities (companies + brands) enriched with hierarchy info.
  function getAllEntities(holdings) {
    const list = [];
    holdings.forEach(h => {
      h.companies.forEach(c => {
        list.push({ slug: c.slug, name: c.name, tagline: c.tagline, accent: c.accent,
          type: 'company', holdingId: h.id, holdingName: h.name, parentSlug: null, parentName: null });
        (c.brands || []).forEach(b => {
          list.push({ slug: b.slug, name: b.name, tagline: b.tagline, accent: b.accent,
            type: 'brand', holdingId: h.id, holdingName: h.name, parentSlug: c.slug, parentName: c.name });
        });
      });
    });
    return list;
  }

  // ─── Mock products ──────────────────────────────────────────────────────────

  const placeholder = (label, color = '0F1B3D') =>
    `https://placehold.co/800x600/${color}/E8EEF7?text=${encodeURIComponent(label)}&font=montserrat`;

  let pid = 1000;
  const P = (companySlug, category, name, short, long, unitsPerBox, origin, createdAt, color = '0F1B3D') => ({
    id: `PRD-${++pid}`,
    companySlug, category, name,
    code: `USF-${pid}`,
    short, long,
    unitsPerBox, origin,
    active: true,
    sharedWith: [],
    createdAt,
    images: [placeholder(name, color), placeholder(name + ' 02', color), placeholder(name + ' 03', color)],
  });

  const PRODUCTS = [
    // Ninefish (marca de AV09 / Group 9)
    P('ninefish', 'Frescos',    'Salmão Fresco Premium',         'Filé selecionado, captura responsável.',   'Filé de salmão fresco selecionado, sem espinhas, com gordura nobre marmorizada. Captura sustentável certificada.',          6,  'Chile',     '2026-04-28', '1E5BC6'),
    P('ninefish', 'Congelados', 'Atum Yellowfin Saku',            'Bloco premium para sashimi.',              'Bloco de atum yellowfin congelado a bordo. Padrão exportação Japão.',                                                     12, 'Brasil',    '2026-05-01', '1E5BC6'),
    P('ninefish', 'Defumados',  'Salmão Defumado a Frio',         'Defumação artesanal lenta.',               'Defumação a frio com madeira nobre, fatiado fino, embalagem a vácuo.',                                                    24, 'Noruega',   '2026-04-12', '1E5BC6'),

    // Ninefoods (marca de AV09 / Group 9)
    P('ninefoods', 'Grãos',     'Arroz Arbório Risoto',           'Grão curto italiano premium.',             'Arroz arbório itália para risoto cremoso. Pacote de 1kg.',                                                                20, 'Itália',    '2026-04-22', '2A7A4A'),
    P('ninefoods', 'Conservas', 'Tomate Pelado San Marzano',      'DOP italiano em lata.',                    'Tomate pelado San Marzano DOP, colheita manual, ideal para molhos.',                                                      24, 'Itália',    '2026-04-30', '2A7A4A'),
    P('ninefoods', 'Orgânicos', 'Quinoa Orgânica Andes',          'Selo orgânico certificado.',               'Quinoa orgânica de altitude, três variedades misturadas.',                                                                30, 'Peru',      '2026-04-15', '2A7A4A'),

    // Peixe Fresco (marca de AV09 / Group 9)
    P('peixe-fresco', 'Inteiros',      'Robalo Inteiro Selvagem', 'Pesca artesanal do litoral SC.',           'Robalo selvagem inteiro, eviscerado, gelo escamado, rastreabilidade total.',                                               4, 'Brasil',    '2026-05-02', '0E7C8C'),
    P('peixe-fresco', 'Filés',         'Filé de Linguado',        'Corte branco delicado.',                   'Filé de linguado fresco, sem pele, sem espinhas, padrão executivo.',                                                      10, 'Brasil',    '2026-04-29', '0E7C8C'),
    P('peixe-fresco', 'Frutos do Mar', 'Camarão Rosa Graúdo',     'VG10/15 selecionado.',                     'Camarão rosa graúdo, classificação VG10/15, descabeçado, congelado individual.',                                          8, 'Brasil',    '2026-04-18', '0E7C8C'),

    // Sulfoods (empresa — produtos diretos)
    P('sulfoods', 'Embutidos', 'Salame Italiano Curado 90 Dias',  'Maturação lenta artesanal.',               'Salame italiano curado naturalmente por 90 dias, receita familiar.',                                                      12, 'Brasil',    '2026-04-25', 'B23A3A'),
    P('sulfoods', 'Carnes',    'Picanha Black Angus',              'Maturação úmida 21 dias.',                 'Picanha Black Angus com maturação úmida, peça a vácuo.',                                                                   6, 'Argentina', '2026-05-03', 'B23A3A'),

    // Legour (marca de Sulfoods)
    P('legour', 'Chocolates', 'Tablete Cacau 70% Origem Única',   'Origem Bahia, conchagem 72h.',             'Chocolate amargo 70% cacau de origem única, conchagem prolongada.',                                                       24, 'Brasil',    '2026-04-20', '8B5E3C'),
    P('legour', 'Biscoitos',  'Amaretti Toscano Tradicional',      'Receita italiana com amêndoa.',            'Biscoito amaretti tradicional toscano, embalagem rígida 200g.',                                                           18, 'Itália',    '2026-04-10', '8B5E3C'),

    // 7E-COM (divisão de FX America — marketplace)
    P('7ecom', 'Eletrônicos',      'Smart TV 55 polegadas 4K HDR', 'Painel IPS com Dolby Vision.',            'Smart TV 55" 4K UHD com HDR10+ e Dolby Vision, sistema operacional integrado.',                                            2, 'China',     '2026-04-26', '5A3DAA'),
    P('7ecom', 'Ferramentas',      'Furadeira de Impacto 750W',    'Mandril 13mm com maleta.',                 'Furadeira de impacto 750W com mandril de 13mm, velocidade variável, maleta.',                                              6, 'Brasil',    '2026-04-21', '5A3DAA'),
    P('7ecom', 'Casa e Decoração', 'Cafeteira Espresso Manual',    'Bomba 15 bar profissional.',               'Cafeteira espresso manual com bomba italiana de 15 bar, vaporizador.',                                                     4, 'Itália',    '2026-04-19', '5A3DAA'),

    // Sevenfish (divisão de FX America)
    P('sevenfish', 'Sushi Grade', 'Atum Bluefin Cubo Premium',     'Akami AAA padrão sushi.',                  'Cubo de atum bluefin AAA, congelado ultra-rápido, padrão sushi premium.',                                                  8, 'Espanha',   '2026-05-01', '1F6F9C'),
    P('sevenfish', 'Frescos',     'Polvo Patagônico',              'Tentáculos limpos e tenros.',              'Polvo da Patagônia limpo, tenro, ideal para grelha ou carpaccio.',                                                         6, 'Argentina', '2026-04-27', '1F6F9C'),

    // DCFoods (empresa standalone)
    P('dcfoods', 'Bebidas',   'Azeite Extra Virgem Andaluz',       'Acidez < 0,3% colheita 2025.',             'Azeite extra virgem andaluz de primeira pressão a frio, garrafa 500ml.',                                                  12, 'Espanha',   '2026-04-14', 'C68A1E'),
    P('dcfoods', 'Mercearia', 'Açafrão Espanhol em Fios',          'Categoria Coupé I.',                       'Açafrão espanhol em fios, categoria Coupé I, frasco 1g lacrado.',                                                         60, 'Espanha',   '2026-04-08', 'C68A1E'),
  ];

  const fmtNum = (n) => new Intl.NumberFormat('pt-BR').format(n);
  const fmtDate = (s) => {
    const d = new Date(s);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  // Capas personalizadas por slug (empresa ou marca) — desktop e mobile
  const HERO_IMAGES = {};

  window.USFORCE_DATA = {
    HOLDINGS, CATEGORIES, HERO_IMAGES, PRODUCTS,
    fmtNum, fmtDate,
    buildEntityMap, getSlugsUnder, getAllEntities,
  };
})();
