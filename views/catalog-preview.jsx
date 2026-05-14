// Pré-visualização e Exportação de Catálogo — USFORCE8
const { useState: useStateCP, useMemo: useMemoCP, useRef: useRefCP } = React;

const A4W = 794;
const A4H = 1123;

// ── Block system ──────────────────────────────────────────────────────────────

const BLOCK_DEFS = [
  { type:'logo',     label:'Logo/Marca',     icon:'Award'         },
  { type:'category', label:'Categoria',       icon:'Tag'           },
  { type:'name',     label:'Nome',            icon:'Type'          },
  { type:'stars',    label:'5 Estrelas',      icon:'Star'          },
  { type:'code',     label:'Código',          icon:'Hash'          },
  { type:'origin',   label:'Origem',          icon:'Globe'         },
  { type:'units',    label:'Embalagem',       icon:'Package'       },
  { type:'short',    label:'Desc. Curta',     icon:'AlignLeft'     },
  { type:'long',     label:'Desc. Longa',     icon:'AlignJustify'  },
  { type:'tagline',  label:'Tagline',         icon:'MessageSquare' },
  { type:'divider',  label:'Divisória',       icon:'Minus'         },
  { type:'spacer',   label:'Espaço flexível', icon:'ArrowUpDown'   },
];

const DEFAULT_LAYOUT = {
  rightCol: [
    { id:'cat-1', type:'category' },
    { id:'div-1', type:'divider'  },
    { id:'nm-1',  type:'name'     },
    { id:'st-1',  type:'stars'    },
    { id:'div-2', type:'divider'  },
    { id:'cd-1',  type:'code'     },
    { id:'or-1',  type:'origin'   },
    { id:'un-1',  type:'units'    },
    { id:'div-3', type:'divider'  },
    { id:'sh-1',  type:'short'    },
    { id:'lg-1',  type:'long'     },
    { id:'sp-1',  type:'spacer'   },
    { id:'tg-1',  type:'tagline'  },
  ],
  leftWidthPct: 47,
  rightBg: 'accent',
};

function getColors(rightBg, accent) {
  switch (rightBg) {
    case 'dark':  return { bg:'#0F1B3D',  text:'#fff',    muted:'rgba(255,255,255,0.45)', dim:'rgba(255,255,255,0.85)', div:'rgba(255,255,255,0.14)' };
    case 'light': return { bg:'#F4F6FB',  text:'#0F1B3D', muted:'rgba(15,27,61,0.5)',    dim:'rgba(15,27,61,0.82)',    div:'rgba(15,27,61,0.12)'    };
    case 'white': return { bg:'#ffffff',  text:'#0F1B3D', muted:'rgba(15,27,61,0.45)',   dim:'rgba(15,27,61,0.8)',     div:'rgba(15,27,61,0.1)'     };
    default:      return { bg: accent,   text:'#fff',    muted:'rgba(255,255,255,0.52)', dim:'rgba(255,255,255,0.9)', div:'rgba(255,255,255,0.18)'  };
  }
}

function FiveStars({ muted = 'rgba(255,255,255,0.88)' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'3px' }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="17" height="17" viewBox="0 0 24 24" fill="#FBBF24" stroke="none">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
      <span style={{ fontSize:'12px', fontWeight:700, color:muted, marginLeft:'5px', fontFamily:'Inter,sans-serif' }}>5.0</span>
    </div>
  );
}

function renderBlock(block, { product, entity, logoUrl, colors }) {
  const units = product.unitsPerBox === 0 ? 'Por peso' : `${product.unitsPerBox} un.`;
  const trunc = (t, n) => t && t.length > n ? t.slice(0,n)+'…' : (t||'');
  const { text, muted, dim } = colors;
  const isLight = colors.bg === '#F4F6FB' || colors.bg === '#ffffff';

  switch (block.type) {
    case 'logo':
      return logoUrl ? (
        <img src={logoUrl} alt={entity?.name}          style={{ maxHeight:'52px', maxWidth:'130px', objectFit:'contain',
                   filter: isLight ? 'none' : 'brightness(0) invert(1)' }} />
      ) : (
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{
            width:'36px', height:'36px', flexShrink:0,
            background:'rgba(128,128,128,0.2)',
            clipPath:'polygon(0 0,100% 0,100% 70%,80% 100%,0 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'13px', fontWeight:900, color:text,
            fontFamily:"'Barlow Condensed',sans-serif",
          }}>{(entity?.name||'').slice(0,2).toUpperCase()}</div>
          <span style={{ fontSize:'16px', fontWeight:900, color:text, textTransform:'uppercase',
                         fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.04em' }}>
            {entity?.name}
          </span>
        </div>
      );
    case 'category':
      return (
        <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:muted }}>
          {product.category}
        </div>
      );
    case 'name':
      return (
        <div style={{ fontSize:'30px', fontWeight:900, color:text, lineHeight:1.05,
                      fontFamily:"'Barlow Condensed',sans-serif", textTransform:'uppercase',
                      letterSpacing:'0.02em', wordBreak:'break-word' }}>
          {product.name}
        </div>
      );
    case 'stars':
      return <FiveStars muted={muted} />;
    case 'code':
      return product.code ? (
        <div style={{ display:'flex', gap:'12px', alignItems:'baseline' }}>
          <span style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:muted, minWidth:'110px', flexShrink:0 }}>Código</span>
          <span style={{ fontSize:'13px', fontWeight:600, color:dim }}>{product.code}</span>
        </div>
      ) : null;
    case 'origin':
      return product.origin ? (
        <div style={{ display:'flex', gap:'12px', alignItems:'baseline' }}>
          <span style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:muted, minWidth:'110px', flexShrink:0 }}>Origem</span>
          <span style={{ fontSize:'13px', fontWeight:600, color:dim }}>{product.origin}</span>
        </div>
      ) : null;
    case 'units':
      return (
        <div style={{ display:'flex', gap:'12px', alignItems:'baseline' }}>
          <span style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:muted, minWidth:'110px', flexShrink:0 }}>Unidades por Caixa</span>
          <span style={{ fontSize:'13px', fontWeight:600, color:dim }}>{units}</span>
        </div>
      );
    case 'short':
      return product.short ? (
        <div style={{ fontSize:'13px', fontWeight:600, color:dim, lineHeight:1.55 }}>
          {trunc(product.short, 160)}
        </div>
      ) : null;
    case 'long':
      return product.long ? (
        <div style={{ fontSize:'12px', color:muted, lineHeight:1.6 }}>
          {trunc(product.long, 300)}
        </div>
      ) : null;
    case 'tagline':
      return (entity?.tagline || entity?.name) ? (
        <div style={{ fontSize:'10px', fontWeight:700, color:muted, letterSpacing:'0.22em', textTransform:'uppercase' }}>
          {entity?.tagline || entity?.name}
        </div>
      ) : null;
    default:
      return null;
  }
}

// ── Page shell ────────────────────────────────────────────────────────────────

function PageShell({ children, bgColor = '#ffffff' }) {
  return (
    <div style={{
      width:`${A4W}px`, height:`${A4H}px`,
      position:'relative', overflow:'hidden',
      background:bgColor, display:'flex', flexDirection:'column',
      fontFamily:'Inter,sans-serif',
    }}>
      {children}
    </div>
  );
}

// ── Portada / Contra-portada ──────────────────────────────────────────────────

function CoverPage({ entity, imgUrl, logoUrl, label, year }) {
  const accent   = entity?.accent || '#1A4A8C';
  const initials = (entity?.name || '??').replace(/[^A-Z0-9]/gi,'').slice(0,2).toUpperCase();

  // Imagem carregada → página inteira sem sobreposição
  if (imgUrl) {
    return (
      <PageShell bgColor="#000">
        <img src={imgUrl} alt={label}          style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }} />
      </PageShell>
    );
  }

  // Design automático — logo substitui iniciais se disponível
  return (
    <PageShell bgColor="#0F1B3D">
      <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${accent} 0%,#0F1B3D 65%)` }} />
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.28)' }} />

      <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px', textAlign:'center' }}>
        {logoUrl ? (
          <img src={logoUrl} alt={entity?.name}            style={{ maxHeight:'90px', maxWidth:'260px', width:'auto', height:'auto', display:'block', objectFit:'contain', filter:'brightness(0) invert(1)', marginBottom:'32px' }} />
        ) : (
          <div style={{ display:'flex', alignItems:'center', gap:'18px', marginBottom:'28px' }}>
            <div style={{
              width:'68px', height:'68px', flexShrink:0, background:accent,
              clipPath:'polygon(0 0,100% 0,100% 70%,85% 100%,0 100%)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'26px', fontWeight:900, color:'#fff', fontFamily:"'Barlow Condensed',sans-serif",
            }}>{initials}</div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:'48px', fontWeight:900, color:'#fff', lineHeight:1, letterSpacing:'0.02em', fontFamily:"'Barlow Condensed',sans-serif", textTransform:'uppercase' }}>
                {entity?.name}
              </div>
              <div style={{ fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.6)', letterSpacing:'0.22em', textTransform:'uppercase', marginTop:'5px' }}>
                {entity?.tagline}
              </div>
            </div>
          </div>
        )}
        {logoUrl && (
          <div style={{ fontSize:'32px', fontWeight:900, color:'#fff', lineHeight:1, letterSpacing:'0.02em', fontFamily:"'Barlow Condensed',sans-serif", textTransform:'uppercase', marginBottom:'16px' }}>
            {entity?.name}
          </div>
        )}
        <div style={{ width:'72px', height:'3px', background:accent, marginBottom:'28px' }} />
        <div style={{ fontSize:'15px', fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.28em', textTransform:'uppercase' }}>
          {label || 'Catálogo de Produtos'} · {year}
        </div>
      </div>

      <div style={{ position:'relative', zIndex:1, padding:'18px 36px', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid rgba(255,255,255,0.12)' }}>
        <span style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.25em', textTransform:'uppercase' }}>USFORCE8</span>
        <span style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.18em', textTransform:'uppercase' }}>usforce8.com</span>
      </div>
    </PageShell>
  );
}

// ── Separador de marca ────────────────────────────────────────────────────────

function BrandPage({ parentEntity, brand, imgUrl, logoUrl, year }) {
  const accent     = brand?.accent || parentEntity?.accent || '#1A4A8C';
  const brandInits = (brand?.name || '').replace(/[^A-Z0-9]/gi,'').slice(0,2).toUpperCase();

  if (imgUrl) {
    return (
      <PageShell bgColor="#000">
        <img src={imgUrl} alt={brand?.name}          style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }} />
      </PageShell>
    );
  }

  return (
    <PageShell bgColor="#0F1B3D">
      <div style={{ position:'absolute', inset:0, background:`linear-gradient(150deg,${accent} 0%,#0F1B3D 70%)` }} />
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.32)' }} />
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'5px', background:accent }} />

      <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px', textAlign:'center' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:'24px' }}>
          {parentEntity?.name} · <span style={{ color:'rgba(255,255,255,0.7)' }}>Catálogo {year}</span>
        </div>
        {logoUrl ? (
          <img src={logoUrl} alt={brand?.name}            style={{ maxHeight:'80px', maxWidth:'240px', width:'auto', height:'auto', display:'block', objectFit:'contain', filter:'brightness(0) invert(1)', marginBottom:'20px' }} />
        ) : (
          <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'20px' }}>
            <div style={{
              width:'56px', height:'56px', background:accent,
              clipPath:'polygon(0 0,100% 0,100% 70%,85% 100%,0 100%)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'22px', fontWeight:900, color:'#fff', fontFamily:"'Barlow Condensed',sans-serif",
            }}>{brandInits}</div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:'56px', fontWeight:900, color:'#fff', lineHeight:1, letterSpacing:'0.01em', fontFamily:"'Barlow Condensed',sans-serif", textTransform:'uppercase' }}>
                {brand?.name}
              </div>
              {brand?.tagline && (
                <div style={{ fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.55)', letterSpacing:'0.2em', textTransform:'uppercase', marginTop:'4px' }}>
                  {brand.tagline}
                </div>
              )}
            </div>
          </div>
        )}
        {logoUrl && (
          <div style={{ fontSize:'48px', fontWeight:900, color:'#fff', lineHeight:1, letterSpacing:'0.01em', fontFamily:"'Barlow Condensed',sans-serif", textTransform:'uppercase', marginBottom:'12px' }}>
            {brand?.name}
          </div>
        )}
        <div style={{ width:'60px', height:'3px', background:accent }} />
      </div>

      <div style={{ position:'relative', zIndex:1, padding:'18px 36px', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid rgba(255,255,255,0.12)' }}>
        <span style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.25em', textTransform:'uppercase' }}>USFORCE8</span>
        <span style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.18em', textTransform:'uppercase' }}>{parentEntity?.name} · {brand?.name}</span>
      </div>
    </PageShell>
  );
}

// ── Separador de categoria ────────────────────────────────────────────────────

function CategoryPage({ entity, catName, imgUrl }) {
  const accent = entity?.accent || '#1A4A8C';
  return (
    <PageShell bgColor="#0F1B3D">
      {imgUrl
        ? <img src={imgUrl} alt={catName}            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
        : <div style={{ position:'absolute', inset:0, background:`linear-gradient(150deg,${accent} 0%,#0F1B3D 70%)` }} />
      }
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)' }} />
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'5px', background:accent }} />

      <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px', textAlign:'center' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:'18px' }}>
          {entity?.name}
        </div>
        <div style={{ fontSize:'70px', fontWeight:900, color:'#fff', lineHeight:1.05, letterSpacing:'0.01em', textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif" }}>
          {catName}
        </div>
        <div style={{ width:'56px', height:'3px', background:accent, marginTop:'26px' }} />
      </div>

      <div style={{ position:'relative', zIndex:1, padding:'18px 36px', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid rgba(255,255,255,0.12)' }}>
        <span style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.25em', textTransform:'uppercase' }}>USFORCE8</span>
        <span style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.18em', textTransform:'uppercase' }}>{entity?.name} · {catName}</span>
      </div>
    </PageShell>
  );
}

// ── Página de produto — layout dinâmico ───────────────────────────────────────

function ProductPage({ entity, product, pageNum, totalPages, layout, logoUrl }) {
  const resolvedLayout = (layout && layout.rightCol) ? layout : DEFAULT_LAYOUT;
  const accent  = entity?.accent || '#1A4A8C';
  const imgUrl  = product.images?.[0] || '';
  const leftPct = Math.max(20, Math.min(70, resolvedLayout.leftWidthPct || 47));
  const LEFT_W  = Math.round(A4W * (leftPct / 100));
  const RIGHT_W = A4W - LEFT_W;
  const HDR_H   = 58;
  const BODY_H  = A4H - HDR_H;
  const PAD     = 36;
  const colors  = getColors(resolvedLayout.rightBg, accent);

  return (
    <PageShell>
      {/* Header */}
      <div style={{ height:`${HDR_H}px`, background:'#fff', borderBottom:'2px solid #F0F2F8', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 26px', flexShrink:0 }}>
        {logoUrl ? (
          <img src={logoUrl} alt={entity?.name}            onError={(e)=>{ e.currentTarget.style.display='none'; const fb=e.currentTarget.nextElementSibling; if(fb) fb.style.display='flex'; }}
            style={{ height:'38px', maxWidth:'180px', width:'auto', objectFit:'contain', display:'block' }} />
        ) : null}
        <div style={{ display: logoUrl ? 'none' : 'flex', alignItems:'center', gap:'10px' }}>
          <div style={{
            width:'30px', height:'30px', flexShrink:0,
            background:accent,
            clipPath:'polygon(0 0,100% 0,100% 70%,80% 100%,0 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'12px', fontWeight:900, color:'#fff',
            fontFamily:"'Barlow Condensed',sans-serif",
          }}>{(entity?.name||'').slice(0,2).toUpperCase()}</div>
          <div>
            <div style={{ fontSize:'13px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.04em', color:'#0F1B3D', lineHeight:1, fontFamily:"'Barlow Condensed',sans-serif" }}>{entity?.name}</div>
            <div style={{ fontSize:'9px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.2em', color:'rgba(15,27,61,0.42)', marginTop:'2px' }}>{entity?.tagline}</div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:'9px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.22em', color:'rgba(15,27,61,0.38)' }}>Catálogo {new Date().getFullYear()}</div>
          <div style={{ fontSize:'9px', fontWeight:600, color:'rgba(15,27,61,0.28)', letterSpacing:'0.14em', marginTop:'2px' }}>Pág. {pageNum} / {totalPages}</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'flex', height:`${BODY_H}px` }}>
        {/* Esquerda: foto */}
        <div style={{ width:`${LEFT_W}px`, height:`${BODY_H}px`, background:'#FAFBFD', flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {imgUrl
            ? <img src={imgUrl} alt={product.name}                style={{ width:'auto', height:'auto', maxWidth:'100%', maxHeight:'100%', display:'block', objectFit:'contain' }} />
            : (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', color:'rgba(15,27,61,0.18)' }}>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
                <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase' }}>Sem imagem</span>
              </div>
            )
          }
        </div>

        {/* Direita: painel de blocos */}
        <div style={{ width:`${RIGHT_W}px`, height:`${BODY_H}px`, background:colors.bg, display:'flex', flexDirection:'column', padding:`${PAD}px`, overflow:'hidden', boxSizing:'border-box' }}>
          {resolvedLayout.rightCol.map((block, i) => {
            if (block.type === 'spacer') {
              return <div key={block.id || `sp-${i}`} style={{ flex:1, minHeight:'8px' }} />;
            }
            if (block.type === 'divider') {
              return <div key={block.id || `dv-${i}`} style={{ height:'1px', background:colors.div, marginBottom:'14px', flexShrink:0 }} />;
            }
            const el = renderBlock(block, { product, entity, logoUrl, colors });
            if (!el) return null;
            return (
              <div key={block.id || `bl-${i}`} style={{ marginBottom:'12px', flexShrink:0 }}>
                {el}
              </div>
            );
          })}
          <div style={{ flex:1 }} />
        </div>
      </div>
    </PageShell>
  );
}

// ── View principal ────────────────────────────────────────────────────────────

function CatalogPreviewView({
  entitySlug, entity, products, holdings, categories,
  catalogConfig, categoryCoverUrls, entityLogos,
  fromAdmin, onBack, onGoAdmin,
}) {
  const { getSlugsUnder, buildEntityMap } = window.USFORCE_DATA;
  const year = new Date().getFullYear();

  const showCategoryCovers = catalogConfig?.showCategoryCovers ?? true;
  const showBrandDividers  = catalogConfig?.showBrandDividers  ?? true;
  const backCoverUrl       = catalogConfig?.backCoverUrl || '';
  const layout             = (catalogConfig?.layout && catalogConfig.layout.rightCol) ? catalogConfig.layout : DEFAULT_LAYOUT;

  const brandList = useMemoCP(() => {
    for (const h of holdings) {
      for (const c of h.companies) {
        if (c.slug === entitySlug) return c.brands || [];
      }
    }
    return [];
  }, [entitySlug, holdings]);
  const isParentCompany = brandList.length > 0;

  const entityMap = useMemoCP(() => buildEntityMap(holdings), [holdings]);

  const slugsToShow = useMemoCP(() => getSlugsUnder(entitySlug, holdings), [entitySlug, holdings]);
  const entityProducts = useMemoCP(() =>
    products.filter(p =>
      p.active && (slugsToShow.includes(p.companySlug) || (p.sharedWith && p.sharedWith.some(s => slugsToShow.includes(s))))
    )
  , [products, slugsToShow]);

  const allCats = useMemoCP(() => {
    const out = [];
    slugsToShow.forEach(s => (categories[s] || []).forEach(c => { if (!out.includes(c)) out.push(c); }));
    return out;
  }, [slugsToShow, categories]);

  const pages = useMemoCP(() => {
    const list = [{ type:'cover' }];

    if (isParentCompany && showBrandDividers) {
      brandList.forEach(brand => {
        const brandProds = entityProducts.filter(p =>
          p.companySlug === brand.slug || (p.sharedWith && p.sharedWith.includes(brand.slug))
        );
        if (!brandProds.length) return;
        list.push({ type:'brand', brand });
        const brandCats = allCats.filter(c => brandProds.some(p => p.category === c));
        brandCats.forEach(cat => {
          const catProds = brandProds.filter(p => p.category === cat);
          if (!catProds.length) return;
          if (showCategoryCovers) list.push({ type:'category', catName:cat, brandSlug:brand.slug });
          catProds.forEach(p => list.push({ type:'product', product:p }));
        });
      });
      const directProds = entityProducts.filter(p => p.companySlug === entitySlug);
      if (directProds.length) {
        allCats.forEach(cat => {
          const catProds = directProds.filter(p => p.category === cat);
          if (!catProds.length) return;
          if (showCategoryCovers) list.push({ type:'category', catName:cat });
          catProds.forEach(p => list.push({ type:'product', product:p }));
        });
      }
    } else {
      allCats.forEach(cat => {
        const prods = entityProducts.filter(p => p.category === cat);
        if (!prods.length) return;
        if (showCategoryCovers) list.push({ type:'category', catName:cat });
        prods.forEach(p => list.push({ type:'product', product:p }));
      });
    }

    if (backCoverUrl) list.push({ type:'backcover' });
    return list;
  }, [entityProducts, allCats, brandList, isParentCompany, showBrandDividers, showCategoryCovers, backCoverUrl]);

  const productPages = pages.filter(p => p.type === 'product');
  let prodCounter    = 0;

  const [exporting,  setExporting]  = useStateCP(false);
  const [exportPct,  setExportPct]  = useStateCP(0);
  const [exportDone, setExportDone] = useStateCP(false);
  const [activeIdx,  setActiveIdx]  = useStateCP(0);
  const pageRefs = useRefCP([]);

  const IcnP = ({ name, ...p }) => { const C = window.lucide[name]; return C ? <C {...p} /> : null; };
  const accent = entity?.accent || '#1A4A8C';

  // Converte URLs externas (Dropbox) em data URLs via proxy do servidor.
  // Necessário porque html2canvas + Dropbox falham por CORS no toDataURL().
  const preloadImagesAsDataURLs = async (container) => {
    const imgs = Array.from(container.querySelectorAll('img'));
    const cache = new Map();
    const originals = [];
    await Promise.all(imgs.map(async (img) => {
      const src = img.getAttribute('src');
      if (!src || src.startsWith('data:')) return;
      originals.push({ img, src });
      try {
        let dataUrl = cache.get(src);
        if (!dataUrl) {
          const proxyUrl = `/api/upload?proxy=${encodeURIComponent(src)}`;
          const resp = await fetch(proxyUrl);
          if (!resp.ok) throw new Error('proxy ' + resp.status);
          const blob = await resp.blob();
          dataUrl = await new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result);
            r.onerror = reject;
            r.readAsDataURL(blob);
          });
          cache.set(src, dataUrl);
        }
        img.setAttribute('src', dataUrl);
        await new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) return resolve();
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      } catch (e) {
        console.warn('proxy falhou para', src, e.message);
      }
    }));
    return originals;
  };

  const exportPDF = async () => {
    if (exporting) return;
    setExporting(true); setExportPct(0); setExportDone(false);
    let restoreList = [];
    try {
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 300));

      // Pre-carrega todas as imagens como data URL em todas as páginas
      for (const el of pageRefs.current) {
        if (!el) continue;
        const restored = await preloadImagesAsDataURLs(el);
        restoreList = restoreList.concat(restored);
      }
      await new Promise(r => setTimeout(r, 200));

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ format:'a4', unit:'mm', orientation:'portrait', compress:true });

      for (let i = 0; i < pageRefs.current.length; i++) {
        const el = pageRefs.current[i];
        if (!el) continue;
        setExportPct(Math.round(((i + 1) / pageRefs.current.length) * 100));
        const canvas = await window.html2canvas(el, {
          scale: 2, useCORS: true, allowTaint: false, logging: false,
          width: A4W, height: A4H, backgroundColor: '#ffffff',
          windowWidth: A4W, windowHeight: A4H,
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.93);
        if (i > 0) doc.addPage();
        doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      const fname = (entity?.name || entitySlug).toLowerCase().replace(/\s+/g,'-');
      doc.save(`catalogo-${fname}-${new Date().getFullYear()}.pdf`);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3500);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Erro ao gerar PDF. Verifique as imagens e tente novamente.\n' + err.message);
    } finally {
      // Restaura URLs originais (pra exibição continuar normal sem refazer fetch)
      restoreList.forEach(({ img, src }) => { try { img.setAttribute('src', src); } catch {} });
      setExporting(false); setExportPct(0);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#111827', display:'flex', flexDirection:'column' }}>

      {/* Topbar */}
      <div style={{ background:'#0F1B3D', borderBottom:'1px solid rgba(255,255,255,0.08)', height:'56px', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, position:'sticky', top:0, zIndex:40 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <button onClick={onBack}
            style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.18em', color:'rgba(255,255,255,0.55)', background:'none', border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
            <IcnP name="ArrowLeft" size={14} color="currentColor" /> Voltar
          </button>
          <div style={{ width:'1px', height:'22px', background:'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'rgba(255,255,255,0.8)', fontFamily:'Inter,sans-serif' }}>
            {entity?.name}
          </span>
          <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.32)', fontFamily:'Inter,sans-serif' }}>
            {pages.length} págs · {productPages.length} produtos · A4
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {fromAdmin && onGoAdmin && (
            <button onClick={onGoAdmin}
              style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.16em', color:'rgba(255,255,255,0.6)', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)', padding:'8px 16px', cursor:'pointer', clipPath:'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)', fontFamily:'Inter,sans-serif' }}>
              <IcnP name="Settings" size={12} color="currentColor" /> Config
            </button>
          )}
          <button onClick={exportPDF} disabled={exporting}
            style={{
              display:'flex', alignItems:'center', gap:'8px',
              fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.18em',
              color:'#fff', background: exportDone ? '#059669' : accent,
              border:'none', padding:'10px 22px', cursor: exporting ? 'wait' : 'pointer',
              clipPath:'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)',
              opacity: exporting ? 0.85 : 1, fontFamily:'Inter,sans-serif', transition:'background 0.3s',
            }}>
            <IcnP name={exportDone ? 'CheckCircle' : exporting ? 'Loader' : 'Download'} size={14} color="#fff" />
            {exportDone ? 'Baixado!' : exporting ? `Gerando… ${exportPct}%` : 'Baixar PDF'}
          </button>
        </div>
      </div>

      {exporting && (
        <div style={{ height:'3px', background:'rgba(255,255,255,0.08)', position:'sticky', top:'56px', zIndex:39 }}>
          <div style={{ height:'100%', background:accent, width:`${exportPct}%`, transition:'width 0.25s' }} />
        </div>
      )}

      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        {/* Miniaturas */}
        <div style={{ width:'110px', background:'#0a0f1e', borderRight:'1px solid rgba(255,255,255,0.06)', overflowY:'auto', flexShrink:0, padding:'12px 8px', display:'flex', flexDirection:'column', gap:'8px' }}>
          {pages.map((_, i) => (
            <button key={i} onClick={() => setActiveIdx(i)}
              style={{
                border: activeIdx === i ? `2px solid ${accent}` : '2px solid transparent',
                background:'transparent', padding:'2px', cursor:'pointer', display:'block', width:'100%',
              }}>
              <div style={{ width:'100%', aspectRatio:'210/297', background: activeIdx === i ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:'10px', fontWeight:700, color: activeIdx === i ? '#fff' : 'rgba(255,255,255,0.3)', fontFamily:'Inter,sans-serif' }}>{i + 1}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Área principal */}
        <div style={{ flex:1, overflowY:'auto', padding:'32px', display:'flex', flexDirection:'column', alignItems:'center', gap:'28px' }}>
          <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.22em', color:'rgba(255,255,255,0.22)', fontFamily:'Inter,sans-serif', alignSelf:'flex-start' }}>
            Catálogo completo · {pages.length} páginas A4 (210 × 297 mm)
          </div>

          {pages.map((page, i) => {
            if (page.type === 'product') prodCounter++;
            const pNum = page.type === 'product' ? prodCounter : 0;
            const productEntity = page.product ? (entityMap[page.product.companySlug] || entity) : entity;
            const pageLogoUrl = page.type === 'product' ? (entityLogos?.[productEntity?.slug] || null) : null;

            return (
              <div key={i} id={`cat-page-${i}`} onClick={() => setActiveIdx(i)}
                style={{
                  boxShadow: activeIdx === i
                    ? `0 0 0 3px ${accent}, 0 16px 56px rgba(0,0,0,0.65)`
                    : '0 8px 36px rgba(0,0,0,0.55)',
                  transition:'box-shadow 0.2s', cursor:'pointer', flexShrink:0,
                }}>
                <div ref={el => { pageRefs.current[i] = el; }}>
                  {page.type === 'cover' && (
                    <CoverPage entity={entity} imgUrl={catalogConfig?.coverUrl}
                      logoUrl={entityLogos?.[entitySlug] || null}
                      label="Catálogo de Produtos" year={year} />
                  )}
                  {page.type === 'brand' && (() => {
                    const brandEnt = entityMap[page.brand?.slug];
                    const bEnt = brandEnt || page.brand;
                    return (
                      <BrandPage parentEntity={entity} brand={bEnt}
                        imgUrl={categoryCoverUrls?.[`brand:${page.brand?.slug}`]}
                        logoUrl={entityLogos?.[bEnt?.slug] || null}
                        year={year} />
                    );
                  })()}
                  {page.type === 'category' && (
                    <CategoryPage
                      entity={page.brandSlug ? (entityMap[page.brandSlug] || entity) : entity}
                      catName={page.catName}
                      imgUrl={categoryCoverUrls?.[page.catName]}
                    />
                  )}
                  {page.type === 'product' && (
                    <ProductPage
                      entity={productEntity}
                      product={page.product}
                      pageNum={pNum}
                      totalPages={productPages.length}
                      layout={layout}
                      logoUrl={pageLogoUrl}
                    />
                  )}
                  {page.type === 'backcover' && (
                    <CoverPage entity={entity} imgUrl={backCoverUrl}
                      logoUrl={entityLogos?.[entitySlug] || null}
                      label="Obrigado pela sua visita" year={year} />
                  )}
                </div>
              </div>
            );
          })}

          {productPages.length === 0 && (
            <div style={{ textAlign:'center', padding:'60px 40px', color:'rgba(255,255,255,0.35)', fontFamily:'Inter,sans-serif' }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom:'14px', display:'block', margin:'0 auto 14px' }}>
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                <polyline points="13,2 13,9 20,9"/>
              </svg>
              <div style={{ fontSize:'12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em' }}>Nenhum produto ativo</div>
            </div>
          )}

          <div style={{ height:'40px' }} />
        </div>
      </div>
    </div>
  );
}

// ── Export para uso no layout editor ─────────────────────────────────────────

window.CatalogShared = {
  A4W, A4H,
  BLOCK_DEFS, DEFAULT_LAYOUT,
  getColors, renderBlock, FiveStars,
  ProductPage,
};
