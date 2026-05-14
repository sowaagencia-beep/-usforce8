// Pré-visualização e Exportação de Catálogo — USFORCE8
// Template Moderno: foto esquerda 47%, painel marca direita 53%, 5 estrelas
const { useState: useStateCP, useMemo: useMemoCP, useRef: useRefCP, useEffect: useEffectCP } = React;

// A4 em px a 96dpi: 794 × 1122
const A4W = 794;
const A4H = 1122;

function StarRating() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
      <span style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.9)', marginLeft:'4px', fontFamily:'Inter, sans-serif' }}>5.0</span>
    </div>
  );
}

function CoverPage({ entity, coverUrl, pageNum }) {
  const accent  = entity?.accent || '#1A4A8C';
  const initials = entity?.name?.replace(/[^A-Z0-9]/gi,'').slice(0,2).toUpperCase() || '??';
  return (
    <div style={{ width:`${A4W}px`, height:`${A4H}px`, position:'relative', overflow:'hidden', background:'#0F1B3D', display:'flex', flexDirection:'column' }}>
      {coverUrl ? (
        <img src={coverUrl} alt="Portada" crossOrigin="anonymous"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
      ) : (
        <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg, ${accent} 0%, #0F1B3D 65%)` }} />
      )}
      {/* Overlay escuro */}
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.38)' }} />

      {/* Conteúdo centrado */}
      <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px' }}>
        {/* Badge da marca */}
        <div style={{ display:'flex', alignItems:'center', gap:'18px', marginBottom:'32px' }}>
          <div style={{
            width:'72px', height:'72px', background: coverUrl ? 'rgba(255,255,255,0.15)' : accent,
            clipPath:'polygon(0 0, 100% 0, 100% 70%, 85% 100%, 0 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'28px', fontWeight:900, color:'#fff',
            fontFamily:"'Barlow Condensed', sans-serif",
          }}>{initials}</div>
          <div>
            <div style={{ fontSize:'52px', fontWeight:900, color:'#fff', lineHeight:1, letterSpacing:'0.02em', fontFamily:"'Barlow Condensed', sans-serif", textTransform:'uppercase' }}>
              {entity?.name}
            </div>
            <div style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.65)', letterSpacing:'0.22em', textTransform:'uppercase', marginTop:'6px', fontFamily:'Inter, sans-serif' }}>
              {entity?.tagline}
            </div>
          </div>
        </div>

        <div style={{ width:'80px', height:'3px', background:accent, marginBottom:'32px' }} />

        <div style={{ fontSize:'16px', fontWeight:700, color:'rgba(255,255,255,0.55)', letterSpacing:'0.3em', textTransform:'uppercase', fontFamily:'Inter, sans-serif' }}>
          Catálogo de Produtos · {new Date().getFullYear()}
        </div>
      </div>

      {/* Footer USFORCE8 */}
      <div style={{ position:'relative', zIndex:1, padding:'20px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid rgba(255,255,255,0.12)' }}>
        <span style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:'0.25em', textTransform:'uppercase', fontFamily:'Inter, sans-serif' }}>USFORCE8</span>
        <span style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Inter, sans-serif' }}>usforce8.com</span>
      </div>
    </div>
  );
}

function CategoryPage({ entity, catName, coverUrl }) {
  const accent = entity?.accent || '#1A4A8C';
  return (
    <div style={{ width:`${A4W}px`, height:`${A4H}px`, position:'relative', overflow:'hidden', background:'#0F1B3D', display:'flex', flexDirection:'column' }}>
      {coverUrl ? (
        <img src={coverUrl} alt={catName} crossOrigin="anonymous"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
      ) : (
        <div style={{ position:'absolute', inset:0, background:`linear-gradient(150deg, ${accent} 0%, #0F1B3D 70%)` }} />
      )}
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)' }} />

      {/* Barra lateral de accent */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'6px', background:accent }} />

      <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px' }}>
        <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.55)', letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:'20px', fontFamily:'Inter, sans-serif' }}>
          {entity?.name}
        </div>
        <div style={{ fontSize:'72px', fontWeight:900, color:'#fff', lineHeight:1.05, letterSpacing:'0.01em', textTransform:'uppercase', textAlign:'center', fontFamily:"'Barlow Condensed', sans-serif" }}>
          {catName}
        </div>
        <div style={{ width:'60px', height:'3px', background:accent, marginTop:'28px' }} />
      </div>

      <div style={{ position:'relative', zIndex:1, padding:'20px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid rgba(255,255,255,0.12)' }}>
        <span style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:'0.25em', textTransform:'uppercase', fontFamily:'Inter, sans-serif' }}>USFORCE8</span>
        <span style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Inter, sans-serif' }}>{entity?.name} · {catName}</span>
      </div>
    </div>
  );
}

function ProductPage({ entity, product, pageNum, totalPages }) {
  const accent  = entity?.accent || '#1A4A8C';
  const imgUrl  = product.images?.[0] || '';
  const units   = product.unitsPerBox === 0 ? 'Por peso' : `${product.unitsPerBox} un.`;

  const LEFT_W  = Math.round(A4W * 0.47);
  const RIGHT_W = A4W - LEFT_W;
  const HDR_H   = 58;
  const BODY_H  = A4H - HDR_H;
  const PAD     = 36;

  // Truncate long description to fit visually
  const truncate = (txt, max) => txt && txt.length > max ? txt.slice(0, max) + '…' : (txt || '');

  return (
    <div style={{ width:`${A4W}px`, height:`${A4H}px`, overflow:'hidden', display:'flex', flexDirection:'column', background:'#fff', fontFamily:'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ height:`${HDR_H}px`, background:'#fff', borderBottom:'2px solid #F4F6FB', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{
            width:'32px', height:'32px', background:accent,
            clipPath:'polygon(0 0, 100% 0, 100% 70%, 80% 100%, 0 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'13px', fontWeight:900, color:'#fff',
            fontFamily:"'Barlow Condensed', sans-serif",
          }}>{entity?.name?.slice(0,2).toUpperCase()}</div>
          <div>
            <div style={{ fontSize:'14px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.04em', color:'#0F1B3D', lineHeight:1, fontFamily:"'Barlow Condensed', sans-serif" }}>{entity?.name}</div>
            <div style={{ fontSize:'9px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'rgba(15,27,61,0.45)', marginTop:'2px' }}>{entity?.tagline}</div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:'9px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.22em', color:'rgba(15,27,61,0.4)' }}>
            Catálogo {new Date().getFullYear()}
          </div>
          <div style={{ fontSize:'9px', fontWeight:700, color:'rgba(15,27,61,0.3)', letterSpacing:'0.15em', marginTop:'2px' }}>
            Pág. {pageNum} / {totalPages}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'flex', height:`${BODY_H}px` }}>

        {/* Esquerda: foto do produto */}
        <div style={{ width:`${LEFT_W}px`, height:`${BODY_H}px`, background:'#FAFBFD', flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
          {imgUrl ? (
            <img src={imgUrl} alt={product.name} crossOrigin="anonymous"
              style={{ width:'100%', height:'100%', objectFit:'contain', display:'block' }} />
          ) : (
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'12px', color:'rgba(15,27,61,0.2)' }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
              <span style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase' }}>Sem imagem</span>
            </div>
          )}
        </div>

        {/* Direita: painel de informações com cor da marca */}
        <div style={{ width:`${RIGHT_W}px`, height:`${BODY_H}px`, background:accent, display:'flex', flexDirection:'column', padding:`${PAD}px`, overflow:'hidden', boxSizing:'border-box' }}>

          {/* Categoria */}
          <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(255,255,255,0.55)', marginBottom:'10px' }}>
            {product.category}
          </div>

          {/* Linha divisória */}
          <div style={{ height:'1px', background:'rgba(255,255,255,0.2)', marginBottom:'18px' }} />

          {/* Nome do produto */}
          <div style={{ fontSize:'32px', fontWeight:900, color:'#fff', lineHeight:1.05, fontFamily:"'Barlow Condensed', sans-serif", textTransform:'uppercase', letterSpacing:'0.02em', marginBottom:'16px', wordBreak:'break-word' }}>
            {product.name}
          </div>

          {/* 5 Estrelas */}
          <div style={{ marginBottom:'20px' }}>
            <StarRating />
          </div>

          {/* Linha divisória */}
          <div style={{ height:'1px', background:'rgba(255,255,255,0.2)', marginBottom:'20px' }} />

          {/* Specs */}
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
            {[
              { label:'Código',     value: product.code },
              { label:'Origem',     value: product.origin },
              { label:'Embalagem',  value: units },
            ].filter(r => r.value).map(row => (
              <div key={row.label} style={{ display:'flex', gap:'10px', alignItems:'baseline' }}>
                <span style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.24em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', width:'74px', flexShrink:0 }}>
                  {row.label}
                </span>
                <span style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.92)', letterSpacing:'0.02em' }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Linha divisória */}
          <div style={{ height:'1px', background:'rgba(255,255,255,0.2)', marginBottom:'18px' }} />

          {/* Descrição curta */}
          {product.short && (
            <div style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.88)', lineHeight:1.55, marginBottom:'14px' }}>
              {truncate(product.short, 160)}
            </div>
          )}

          {/* Descrição longa */}
          {product.long && (
            <div style={{ fontSize:'12px', fontWeight:400, color:'rgba(255,255,255,0.7)', lineHeight:1.6, flex:1, overflow:'hidden' }}>
              {truncate(product.long, 320)}
            </div>
          )}

          {/* Rodapé do painel */}
          <div style={{ marginTop:'auto', paddingTop:'16px', borderTop:'1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:'0.22em', textTransform:'uppercase' }}>
              {entity?.tagline || entity?.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CatalogPreviewView({
  entitySlug, entity, products, holdings, categories,
  catalogConfig, categoryCoverUrls,
  fromAdmin, onBack, onGoAdmin,
}) {
  const { getSlugsUnder } = window.USFORCE_DATA;

  // Products belonging to this entity
  const slugsToShow = useMemoCP(() => getSlugsUnder(entitySlug, holdings), [entitySlug, holdings]);

  const entityProducts = useMemoCP(() =>
    products.filter(p =>
      p.active &&
      (slugsToShow.includes(p.companySlug) ||
       (p.sharedWith && p.sharedWith.some(s => slugsToShow.includes(s))))
    )
  , [products, slugsToShow]);

  // Group products by category (maintain category order)
  const allCats = useMemoCP(() => {
    const out = [];
    slugsToShow.forEach(s => (categories[s] || []).forEach(c => { if (!out.includes(c)) out.push(c); }));
    return out;
  }, [slugsToShow, categories]);

  const byCategory = useMemoCP(() => {
    const map = {};
    allCats.forEach(c => { map[c] = entityProducts.filter(p => p.category === c); });
    return map;
  }, [entityProducts, allCats]);

  // Build pages list
  const pages = useMemoCP(() => {
    const list = [{ type:'cover' }];
    allCats.forEach(cat => {
      const prods = byCategory[cat] || [];
      if (!prods.length) return;
      list.push({ type:'category', catName: cat });
      prods.forEach(p => list.push({ type:'product', product: p }));
    });
    return list;
  }, [allCats, byCategory]);

  // Product pages only (for page number calculation)
  const productPages = pages.filter(p => p.type === 'product');
  const totalPages   = pages.length;

  const [exporting,    setExporting]    = useStateCP(false);
  const [exportPct,    setExportPct]    = useStateCP(0);
  const [exportDone,   setExportDone]   = useStateCP(false);
  const [currentPage,  setCurrentPage]  = useStateCP(0);
  const pageRefs = useRefCP([]);

  const IcnP = ({ name, ...p }) => { const C = window.lucide[name]; return C ? <C {...p} /> : null; };

  const exportPDF = async () => {
    if (exporting) return;
    setExporting(true);
    setExportPct(0);
    setExportDone(false);
    try {
      // Wait for fonts + images to fully render
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 600));

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ format:'a4', unit:'mm', orientation:'portrait', compress:true });

      for (let i = 0; i < pageRefs.current.length; i++) {
        const el = pageRefs.current[i];
        if (!el) continue;
        setExportPct(Math.round((i / pageRefs.current.length) * 100));

        const canvas = await window.html2canvas(el, {
          scale:      2,
          useCORS:    true,
          allowTaint: false,
          logging:    false,
          width:      A4W,
          height:     A4H,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        if (i > 0) doc.addPage();
        doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      const slug = entity?.name?.toLowerCase().replace(/\s+/g,'-') || entitySlug;
      doc.save(`catalogo-${slug}-${new Date().getFullYear()}.pdf`);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Erro ao gerar PDF. Verifique as imagens e tente novamente.');
    } finally {
      setExporting(false);
      setExportPct(0);
    }
  };

  const accent = entity?.accent || '#1A4A8C';

  return (
    <div style={{ minHeight:'100vh', background:'#1a1a2e', display:'flex', flexDirection:'column' }}>

      {/* Top bar */}
      <div style={{ background:'#0F1B3D', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, position:'sticky', top:0, zIndex:40 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <button onClick={onBack}
            style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.18em', color:'rgba(255,255,255,0.6)', background:'none', border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
            <IcnP name="ArrowLeft" size={14} color="currentColor" /> Voltar
          </button>
          <div style={{ width:'1px', height:'24px', background:'rgba(255,255,255,0.12)' }} />
          <div>
            <span style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'rgba(255,255,255,0.4)', fontFamily:'Inter, sans-serif' }}>Pré-visualização · </span>
            <span style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'rgba(255,255,255,0.85)', fontFamily:'Inter, sans-serif' }}>{entity?.name}</span>
          </div>
          <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', fontWeight:600, fontFamily:'Inter, sans-serif', letterSpacing:'0.15em' }}>
            {totalPages} págs · {productPages.length} produtos
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {fromAdmin && onGoAdmin && (
            <button onClick={onGoAdmin}
              style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.16em', color:'rgba(255,255,255,0.6)', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', padding:'8px 16px', cursor:'pointer', clipPath:'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)', fontFamily:'Inter, sans-serif' }}>
              <IcnP name="Settings" size={13} color="currentColor" /> Config
            </button>
          )}
          <button onClick={exportPDF} disabled={exporting}
            style={{
              display:'flex', alignItems:'center', gap:'8px',
              fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.18em',
              color:'#fff', background: exportDone ? '#059669' : accent,
              border:'none', padding:'10px 22px', cursor: exporting ? 'wait' : 'pointer',
              clipPath:'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
              opacity: exporting ? 0.8 : 1,
              fontFamily:'Inter, sans-serif',
              transition:'background 0.3s',
            }}>
            <IcnP name={exportDone ? 'CheckCircle' : exporting ? 'Loader' : 'Download'} size={14} color="#fff"
              className={exporting ? 'animate-spin' : ''} />
            {exportDone ? 'Baixado!' : exporting ? `Gerando… ${exportPct}%` : 'Baixar PDF'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {exporting && (
        <div style={{ height:'3px', background:'rgba(255,255,255,0.1)', position:'sticky', top:'56px', zIndex:39 }}>
          <div style={{ height:'100%', background:accent, width:`${exportPct}%`, transition:'width 0.3s' }} />
        </div>
      )}

      {/* Pages */}
      <div style={{ flex:1, padding:'40px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:'24px' }}>

        {/* Page counter */}
        <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.22em', color:'rgba(255,255,255,0.3)', fontFamily:'Inter, sans-serif', marginBottom:'8px' }}>
          Catálogo completo — role para visualizar todas as páginas
        </div>

        {pages.map((page, i) => {
          // Calculate product page number
          let prodPageNum = 0;
          if (page.type === 'product') {
            let count = 0;
            for (let j = 0; j <= i; j++) { if (pages[j].type === 'product') count++; }
            prodPageNum = count;
          }

          return (
            <div key={i}
              style={{ position:'relative', cursor:'pointer' }}
              onClick={() => setCurrentPage(i)}>
              {/* Page number label */}
              <div style={{ position:'absolute', top:'-20px', left:0, fontSize:'10px', fontWeight:700, color: currentPage === i ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)', letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Inter, sans-serif' }}>
                {i + 1}
              </div>
              {/* Shadow + border */}
              <div style={{
                boxShadow: currentPage === i
                  ? `0 0 0 2px ${accent}, 0 20px 60px rgba(0,0,0,0.6)`
                  : '0 8px 40px rgba(0,0,0,0.5)',
                transition:'box-shadow 0.2s',
              }}>
                <div ref={el => pageRefs.current[i] = el}>
                  {page.type === 'cover' && (
                    <CoverPage
                      entity={entity}
                      coverUrl={catalogConfig?.coverUrl}
                    />
                  )}
                  {page.type === 'category' && (
                    <CategoryPage
                      entity={entity}
                      catName={page.catName}
                      coverUrl={categoryCoverUrls?.[page.catName]}
                    />
                  )}
                  {page.type === 'product' && (
                    <ProductPage
                      entity={entity}
                      product={page.product}
                      pageNum={prodPageNum}
                      totalPages={productPages.length}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {productPages.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 40px', color:'rgba(255,255,255,0.4)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom:'16px', opacity:0.5 }}>
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13,2 13,9 20,9"/>
            </svg>
            <div style={{ fontSize:'13px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'8px', fontFamily:'Inter, sans-serif' }}>
              Nenhum produto ativo
            </div>
            <div style={{ fontSize:'12px', fontFamily:'Inter, sans-serif' }}>
              Ative produtos no painel para gerar o catálogo.
            </div>
          </div>
        )}

        <div style={{ height:'60px' }} />
      </div>
    </div>
  );
}
