// Vitrine pública (showcase) — USFORCE8

const { useState: useStateShow, useMemo: useMemoShow, useRef: useRefShow } = React;

function Ic({ name, ...p }) { const C = window.lucide[name]; return C ? <C {...p} /> : null; }

function PublicShowcaseView({ companySlug, products, holdings, categories, heroImage, onSelectProduct, onBackToAdmin, onUpdateHero, fromAdmin }) {
  const { buildEntityMap, getSlugsUnder } = window.USFORCE_DATA;

  const entityMap = buildEntityMap(holdings);
  const entity    = entityMap[companySlug];

  // All slugs whose products belong to this vitrina
  // (e.g. 'av09' → ['av09','ninefish','ninefoods','peixe-fresco'])
  const slugsToShow = getSlugsUnder(companySlug, holdings);

  // Aggregate categories from all relevant slugs
  const cats = useMemoShow(() => {
    const all = [];
    slugsToShow.forEach(s => (categories[s] || []).forEach(c => { if (!all.includes(c)) all.push(c); }));
    return all;
  }, [slugsToShow, categories]);

  // Products visible in this vitrina
  const vitrineProducts = useMemoShow(() => {
    return products.filter(p => {
      if (!p.active) return false;
      if (slugsToShow.includes(p.companySlug)) return true;
      if (p.sharedWith && p.sharedWith.some(s => slugsToShow.includes(s))) return true;
      return false;
    });
  }, [products, slugsToShow]);

  const [activeCat, setActiveCat] = useStateShow('all');
  const [search,    setSearch]    = useStateShow('');
  const [page,      setPage]      = useStateShow(1);
  const PAGE_SIZE = 8;

  // Banner editor
  const [showBannerModal, setShowBannerModal] = useStateShow(false);
  const [bannerForm, setBannerForm] = useStateShow({ desktop: heroImage?.desktop || '', mobile: heroImage?.mobile || '' });
  const desktopRef = useRefShow(null);
  const mobileRef  = useRefShow(null);

  const handleFile = (file, key) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBannerForm(s => ({ ...s, [key]: reader.result }));
    reader.readAsDataURL(file);
  };

  const openBannerModal = () => {
    setBannerForm({ desktop: heroImage?.desktop || '', mobile: heroImage?.mobile || '' });
    setShowBannerModal(true);
  };

  const saveBanner = () => {
    onUpdateHero(companySlug, bannerForm);
    setShowBannerModal(false);
  };

  const filtered = useMemoShow(() => {
    return vitrineProducts.filter(p => {
      if (activeCat !== 'all' && p.category !== activeCat) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.short.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [vitrineProducts, activeCat, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!entity) return null;

  const hasCustomHero = heroImage && (heroImage.desktop || heroImage.mobile);

  // ── Contact & logo maps ──────────────────────────────────────────────────
  const contactInfo = {
    'av09':         ['R. Maurício Pacheco, Nº 840 — Sala 9', 'Barra do Rio · Itajaí · SC · CEP 88305-615', '+55 (47) 3367-9909'],
    'ninefish':     ['R. Maurício Pacheco, Nº 840 — Sala 9', 'Barra do Rio · Itajaí · SC · CEP 88305-615', '+55 (47) 3367-9909'],
    'ninefoods':    ['R. Maurício Pacheco, Nº 840 — Sala 9', 'Barra do Rio · Itajaí · SC · CEP 88305-615', '+55 (47) 3367-9909'],
    'peixe-fresco': ['R. Maurício Pacheco, Nº 840 — Sala 9', 'Barra do Rio · Itajaí · SC · CEP 88305-615', '+55 (47) 3367-9909'],
    'sulfoods':     ['Rua Manoel Stefenon, 1150 — Tamandaré', 'Garibaldi – RS · CEP 95720-000', '+55 (54) 98110-7777 · +55 (54) 98141-7777'],
    'legour':       ['Rua Manoel Stefenon, 1150 — Tamandaré', 'Garibaldi – RS · CEP 95720-000', '+55 (54) 98110-7777 · +55 (54) 98141-7777'],
    'fxamerica':    ['R. 1822, nº 400 – Sala 801', 'Centro, Balneário Camboriú – SC · CEP 88330-484', '+55 (47) 2033 9700 · +55 (47) 99228 3737 · +55 (47) 99121 0707'],
    'sevenfish':    ['R. 1822, nº 400 – Sala 801', 'Centro, Balneário Camboriú – SC · CEP 88330-484', '+55 (47) 2033-9700'],
    '7ecom':        ['R. 1822, nº 400 – Sala 801', 'Centro, Balneário Camboriú – SC · CEP 88330-484', '+55 (47) 2033 9700 · +55 (47) 99228 3737'],
    'dcfoods':      ['Rua Emanuel Kant, 60 – Sala 1111 – Ed. H. A. Offices', 'Capão Raso, Curitiba – PR · CEP 81020-670', 'WhatsApp: +55 (47) 99914-7000'],
    'oceanfoods':   ['Rua Mestra Maria Peclat QD 1D LOT 1', 'Jardim Todos os Santos 2 · Sen. Canedo – GO', '+55 47 99914-7000'],
  };

  const footerLogos = {
    'av09':         'logo_av09.svg',
    'ninefish':     'logo_av09.svg',
    'ninefoods':    'logo_av09.svg',
    'peixe-fresco': 'logo_av09.svg',
    'sulfoods':     'logo_sulfoods.svg',
    'legour':       'logo_sulfoods.svg',
    'sevenfish':    'logo_sevenfish.svg',
    'dcfoods':      'logo_dcfoods.svg',
    'fxamerica':    'logo_fxamerica.svg',
    '7ecom':        'logo_fxamerica.svg',
    'oceanfoods':   'logo_oceanfoods.svg',
  };

  const info    = contactInfo[companySlug] || [];
  const logoSrc = footerLogos[companySlug];

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col">

      {/* Header */}
      <header className="h-12 bg-white border-b border-[#0F1B3D]/10 flex items-center justify-center px-6 relative">
        <UsforceLogo size={22} />
        {fromAdmin && (
          <button onClick={onBackToAdmin}
            className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0F1B3D]/70 hover:text-[#0F1B3D] bg-[#F4F6FB] border border-[#0F1B3D]/15 px-3 py-1.5">
            <Ic name="ArrowLeft" size={12} /> Voltar ao Painel
          </button>
        )}
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-[0.2em] text-[#0F1B3D]/40">
          Vitrine · {entity.name}
          {entity.type === 'brand' && entity.parentName && ` · ${entity.parentName}`}
        </span>
      </header>

      {/* Hero */}
      <div className="relative group">
        {hasCustomHero ? (
          <div className="relative w-full overflow-hidden bg-[#0F1B3D]" style={{ minHeight: '220px' }}>
            <picture>
              {heroImage.mobile && <source media="(max-width: 767px)" srcSet={heroImage.mobile} />}
              <img src={heroImage.desktop || heroImage.mobile} alt={`Banner ${entity.name}`}
                className="w-full block" style={{ maxHeight: '420px', objectFit: 'cover', width: '100%' }} />
            </picture>
          </div>
        ) : (
          <div className="relative overflow-hidden"
               style={{ background: `linear-gradient(120deg, ${entity.accent || '#1E5BC6'} 0%, #0F1B3D 100%)` }}>
            <div className="relative max-w-[1280px] mx-auto px-8 py-12 flex flex-col items-center justify-center text-white text-center">
              <CompanyMark company={entity} size="xl" light />
              {entity.type === 'brand' && entity.parentName && (
                <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/60">{entity.parentName} · {entity.holdingName}</div>
              )}
              <p className="mt-5 max-w-xl text-sm text-white/80 leading-relaxed">
                Catálogo oficial · Produtos disponíveis para solicitação de orçamento. Seleção rigorosamente curada para nossos parceiros.
              </p>
            </div>
          </div>
        )}

        {fromAdmin && (
          <button onClick={openBannerModal}
            className="absolute bottom-3 right-3 inline-flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-black/80 text-white text-[11px] font-bold uppercase tracking-[0.16em] backdrop-blur-sm transition-colors"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}>
            <Ic name="Camera" size={14} /> Editar Banner
          </button>
        )}
      </div>

      {/* Banner modal */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowBannerModal(false)}>
          <div className="absolute inset-0 bg-[#0F1B3D]/60 backdrop-blur-sm" />
          <div onClick={e => e.stopPropagation()} className="relative w-full max-w-2xl bg-white shadow-2xl"
               style={{ clipPath: 'polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%)' }}>
            <div className="px-6 pt-5 pb-4 border-b border-[#0F1B3D]/10 flex items-start justify-between">
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-[#0F1B3D]"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Editar Banner da Vitrina</h3>
                <p className="text-xs text-[#0F1B3D]/60 mt-0.5">{entity.name} · Imagem de capa</p>
              </div>
              <button onClick={() => setShowBannerModal(false)} className="h-7 w-7 flex items-center justify-center text-[#0F1B3D]/60 hover:bg-[#F4F6FB]">
                <Ic name="X" size={14} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* Desktop */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/70">Banner Desktop</label>
                  <span className="text-[10px] font-semibold text-[#0F1B3D]/40 bg-[#F4F6FB] px-2 py-0.5">Recomendado: 1280 × 420 px</span>
                </div>
                <input ref={desktopRef} type="file" accept="image/*" className="hidden"
                  onChange={e => handleFile(e.target.files[0], 'desktop')} />
                {bannerForm.desktop ? (
                  <div className="relative border border-[#0F1B3D]/15 overflow-hidden" style={{ aspectRatio: '1280/420' }}>
                    <img src={bannerForm.desktop} className="w-full h-full object-cover" alt="Preview desktop" />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                      <button onClick={() => desktopRef.current.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#0F1B3D] text-[11px] font-bold uppercase tracking-[0.16em]">
                        <Ic name="RefreshCw" size={12} /> Trocar imagem
                      </button>
                    </div>
                    <button onClick={() => setBannerForm(s => ({ ...s, desktop: '' }))}
                      className="absolute top-2 right-2 h-7 w-7 bg-black/60 hover:bg-black/80 flex items-center justify-center text-white">
                      <Ic name="X" size={12} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => desktopRef.current.click()}
                    className="w-full border-2 border-dashed border-[#0F1B3D]/20 hover:border-[#0F1B3D]/50 bg-[#F4F6FB] hover:bg-[#EEF2F9] transition-colors flex flex-col items-center justify-center gap-2 py-8 text-[#0F1B3D]/50 hover:text-[#0F1B3D]"
                    style={{ aspectRatio: '1280/420' }}>
                    <Ic name="Upload" size={22} />
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Clique para enviar</span>
                    <span className="text-[10px]">JPG, PNG, WEBP · máx. 5 MB</span>
                  </button>
                )}
              </div>
              {/* Mobile */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/70">Banner Mobile</label>
                  <span className="text-[10px] font-semibold text-[#0F1B3D]/40 bg-[#F4F6FB] px-2 py-0.5">Recomendado: 768 × 400 px</span>
                </div>
                <input ref={mobileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => handleFile(e.target.files[0], 'mobile')} />
                {bannerForm.mobile ? (
                  <div className="relative border border-[#0F1B3D]/15 overflow-hidden" style={{ aspectRatio: '768/400' }}>
                    <img src={bannerForm.mobile} className="w-full h-full object-cover" alt="Preview mobile" />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                      <button onClick={() => mobileRef.current.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#0F1B3D] text-[11px] font-bold uppercase tracking-[0.16em]">
                        <Ic name="RefreshCw" size={12} /> Trocar imagem
                      </button>
                    </div>
                    <button onClick={() => setBannerForm(s => ({ ...s, mobile: '' }))}
                      className="absolute top-2 right-2 h-7 w-7 bg-black/60 hover:bg-black/80 flex items-center justify-center text-white">
                      <Ic name="X" size={12} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => mobileRef.current.click()}
                    className="w-full border-2 border-dashed border-[#0F1B3D]/20 hover:border-[#0F1B3D]/50 bg-[#F4F6FB] hover:bg-[#EEF2F9] transition-colors flex flex-col items-center justify-center gap-2 py-6 text-[#0F1B3D]/50 hover:text-[#0F1B3D]"
                    style={{ aspectRatio: '768/400' }}>
                    <Ic name="Smartphone" size={20} />
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Clique para enviar</span>
                    <span className="text-[10px]">JPG, PNG, WEBP · máx. 3 MB</span>
                  </button>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#0F1B3D]/10 flex items-center justify-between">
              <button onClick={() => { onUpdateHero(companySlug, { desktop: '', mobile: '' }); setShowBannerModal(false); }}
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-500 hover:text-red-700">
                Remover banner
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowBannerModal(false)}
                  className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F1B3D]/60 hover:text-[#0F1B3D] px-3 py-2">
                  Cancelar
                </button>
                <PrimaryBtn onClick={saveBanner} icon={<Ic name="Save" size={13} />}>Salvar Banner</PrimaryBtn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category nav + search */}
      <div className="bg-white border-b border-[#0F1B3D]/10 sticky top-0 z-10">
        <div className="px-8 flex items-center justify-between flex-wrap gap-4">
          <nav className="flex items-center gap-1 overflow-x-auto">
            <CatTab active={activeCat === 'all'} onClick={() => { setActiveCat('all'); setPage(1); }}>Todos os Produtos</CatTab>
            {cats.map(c => (
              <CatTab key={c} active={activeCat === c} onClick={() => { setActiveCat(c); setPage(1); }}>{c}</CatTab>
            ))}
          </nav>
          <div className="relative w-full md:w-72 my-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0F1B3D]/40"><Ic name="Search" size={14} /></span>
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar produtos..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/10 focus:border-[#0F1B3D]/30 focus:bg-white outline-none" />
          </div>
        </div>
      </div>

      {/* Products */}
      <main className="flex-1 w-full px-8 py-10">
        {pageItems.length === 0 ? (
          <div className="text-center py-24">
            <Ic name="PackageX" size={32} className="mx-auto text-[#0F1B3D]/30" />
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[#0F1B3D]/60">Nenhum produto encontrado</p>
            <p className="text-xs text-[#0F1B3D]/50 mt-1">Tente outra categoria ou refine sua busca.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pageItems.map(p => <ShowcaseCard key={p.id} product={p} onSelect={() => onSelectProduct(p)} />)}
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="h-9 w-9 flex items-center justify-center bg-white border border-[#0F1B3D]/15 text-[#0F1B3D]/60 hover:border-[#0F1B3D] hover:text-[#0F1B3D] disabled:opacity-30">
              <Ic name="ChevronLeft" size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`h-9 w-9 flex items-center justify-center text-xs font-bold transition-colors ${n === page ? 'bg-[#0F1B3D] text-white' : 'bg-white border border-[#0F1B3D]/15 text-[#0F1B3D] hover:border-[#0F1B3D]'}`}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="h-9 w-9 flex items-center justify-center bg-white border border-[#0F1B3D]/15 text-[#0F1B3D]/60 hover:border-[#0F1B3D] hover:text-[#0F1B3D] disabled:opacity-30">
              <Ic name="ChevronRight" size={14} />
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0F1B3D] text-white">
        <div className="max-w-[1280px] mx-auto px-8 py-10 flex items-center justify-between gap-6">
          <div className="text-xs leading-relaxed text-white/70">
            {info.map((line, i) => <span key={i}>{line}{i < info.length - 1 && <br />}</span>)}
          </div>
          {logoSrc && (
            <img src={logoSrc} alt={entity.name}
              style={{ height: 40, width: 'auto', filter: 'brightness(0) invert(1)', flexShrink: 0 }} />
          )}
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-[1280px] mx-auto px-8 py-4 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/50">
            <span>© 2026 {entity.holdingName} · Todos os direitos reservados</span>
            <span>Powered by USFORCE8</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CatTab({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] whitespace-nowrap transition-colors border-b-2 ${active ? 'border-[#0F1B3D] text-[#0F1B3D]' : 'border-transparent text-[#0F1B3D]/50 hover:text-[#0F1B3D]'}`}>
      {children}
    </button>
  );
}

function ShowcaseCard({ product, onSelect }) {
  return (
    <ChamferCard chamfer={18} className="bg-white border border-[#0F1B3D]/10 hover:border-[#0F1B3D]/40 transition-colors flex flex-col group">
      <div className="relative">
        <ProductImage product={product} heightClass="h-64" />
        <div className="absolute top-3 right-3"><CategoryTag>{product.category}</CategoryTag></div>
      </div>
      <div className="px-4 pt-4 pb-4 flex-1 flex flex-col">
        <h3 className="font-bold text-[#0F1B3D] uppercase tracking-tight leading-tight"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '17px', letterSpacing: '0.01em' }}>
          {product.name}
        </h3>
        <p className="text-xs text-[#0F1B3D]/60 mt-1.5 line-clamp-2 leading-relaxed">{product.short}</p>
        <div className="mt-3 pt-3 border-t border-[#0F1B3D]/10 grid grid-cols-3 gap-1 text-center">
          <div>
            <div className="text-[9px] uppercase tracking-[0.16em] text-[#0F1B3D]/40 font-bold">Cód.</div>
            <div className="text-[11px] font-bold text-[#0F1B3D] truncate">{product.code}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.16em] text-[#0F1B3D]/40 font-bold">Unid./Cx</div>
            <div className="text-sm font-black text-[#0F1B3D]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{product.unitsPerBox}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.16em] text-[#0F1B3D]/40 font-bold">Origem</div>
            <div className="text-[11px] font-bold text-[#0F1B3D] truncate">{product.origin}</div>
          </div>
        </div>
        <button onClick={onSelect}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0F1B3D] bg-white border border-[#0F1B3D]/20 hover:bg-[#0F1B3D] hover:text-white transition-colors">
          Ver Detalhes <Ic name="ArrowRight" size={11} />
        </button>
      </div>
    </ChamferCard>
  );
}

window.PublicShowcaseView = PublicShowcaseView;
