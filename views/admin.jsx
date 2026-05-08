// Painel Administrativo — USFORCE8

const { useState: useStateAdmin, useMemo: useMemoAdmin } = React;

function Icn({ name, ...p }) { const C = window.lucide[name]; return C ? <C {...p} /> : null; }

function AdminView({
  products, holdings, categories,
  onNavigate, onLogout, onNewProduct, onEditProduct, onDeleteProduct,
  onCreateHolding, onCreateCompany, onCreateBrand,
  adminEmail,
}) {
  const { fmtNum, fmtDate, buildEntityMap, getSlugsUnder } = window.USFORCE_DATA;

  const entityMap = useMemoAdmin(() => buildEntityMap(holdings), [holdings]);

  const [filterHolding,  setFilterHolding]  = useStateAdmin('all');
  const [filterEntity,   setFilterEntity]   = useStateAdmin('all');
  const [filterCategory, setFilterCategory] = useStateAdmin('all');
  const [search,         setSearch]         = useStateAdmin('');

  // Sidebar tree state
  const [expandedHolding, setExpandedHolding] = useStateAdmin({ group9: true, opolski: true });
  const [expandedCompany, setExpandedCompany] = useStateAdmin({ av09: true });
  const [selectedSlug,    setSelectedSlug]    = useStateAdmin(null); // company or brand slug

  // Modals
  const [showHoldingModal, setShowHoldingModal] = useStateAdmin(false);
  const [holdingForm, setHoldingForm] = useStateAdmin({ name: '', tagline: '' });

  const [showCompanyModal, setShowCompanyModal] = useStateAdmin(false);
  const [companyForm, setCompanyForm] = useStateAdmin({ holdingId: 'group9', name: '', tagline: '', accent: '#1A4A8C', categories: '' });

  const [showBrandModal, setShowBrandModal] = useStateAdmin(false);
  const [brandForm, setBrandForm] = useStateAdmin({ companySlug: '', name: '', tagline: '', accent: '#1A4A8C', categories: '' });

  const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const openAddCompany = (holdingId) => {
    setCompanyForm({ holdingId, name: '', tagline: '', accent: '#1A4A8C', categories: '' });
    setShowCompanyModal(true);
  };
  const openAddBrand = (companySlug) => {
    setBrandForm({ companySlug, name: '', tagline: '', accent: '#1A4A8C', categories: '' });
    setShowBrandModal(true);
  };

  const submitHolding = () => {
    if (!holdingForm.name.trim()) return;
    const id = slugify(holdingForm.name);
    onCreateHolding({ id, name: holdingForm.name.trim(), tagline: holdingForm.tagline.trim() || 'Holding' });
    setShowHoldingModal(false);
    setHoldingForm({ name: '', tagline: '' });
  };

  const submitCompany = () => {
    if (!companyForm.name.trim()) return;
    const slug = slugify(companyForm.name);
    onCreateCompany(companyForm.holdingId, {
      slug, name: companyForm.name.trim(),
      tagline: companyForm.tagline.trim() || 'Empresa',
      accent: companyForm.accent,
    }, companyForm.categories.split(',').map(s => s.trim()).filter(Boolean));
    setShowCompanyModal(false);
    setCompanyForm({ holdingId: 'group9', name: '', tagline: '', accent: '#1A4A8C', categories: '' });
  };

  const submitBrand = () => {
    if (!brandForm.name.trim()) return;
    const slug = slugify(brandForm.name);
    onCreateBrand(brandForm.companySlug, {
      slug, name: brandForm.name.trim(),
      tagline: brandForm.tagline.trim() || 'Marca',
      accent: brandForm.accent,
    }, brandForm.categories.split(',').map(s => s.trim()).filter(Boolean));
    setShowBrandModal(false);
    setBrandForm({ companySlug: '', name: '', tagline: '', accent: '#1A4A8C', categories: '' });
  };

  // Build filter slug list for selected sidebar item
  const filterSlugs = useMemoAdmin(() => {
    if (!selectedSlug) return null;
    return getSlugsUnder(selectedSlug, holdings);
  }, [selectedSlug, holdings]);

  const filtered = useMemoAdmin(() => {
    return products.filter(p => {
      const e = entityMap[p.companySlug];
      if (!e) return false;
      if (filterSlugs) {
        const inDirect = filterSlugs.includes(p.companySlug);
        const inShared = p.sharedWith && p.sharedWith.some(s => filterSlugs.includes(s));
        if (!inDirect && !inShared) return false;
      }
      if (filterHolding !== 'all' && e.holdingId !== filterHolding) return false;
      if (filterEntity !== 'all' && p.companySlug !== filterEntity) return false;
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q) && !p.short.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [products, filterSlugs, filterHolding, filterEntity, filterCategory, search, entityMap]);

  const kpis = useMemoAdmin(() => {
    const total = products.length;
    let totalEntities = 0;
    holdings.forEach(h => { totalEntities += h.companies.length; h.companies.forEach(c => { totalEntities += (c.brands || []).length; }); });
    return { total, totalEntities };
  }, [products, holdings]);

  // All entities flat (for filter dropdown)
  const allEntitiesFlat = useMemoAdmin(() => {
    const list = [];
    holdings.forEach(h => {
      h.companies.forEach(c => {
        list.push({ v: c.slug, l: c.name, holdingId: h.id });
        (c.brands || []).forEach(b => list.push({ v: b.slug, l: `  ↳ ${b.name}`, holdingId: h.id }));
      });
    });
    return list;
  }, [holdings]);

  const filteredEntities = filterHolding === 'all'
    ? allEntitiesFlat
    : allEntitiesFlat.filter(e => e.holdingId === filterHolding);

  const availableCategories = filterEntity !== 'all'
    ? (categories[filterEntity] || [])
    : [...new Set(Object.values(categories).flat())].filter(Boolean);

  const selectedEntity = selectedSlug ? entityMap[selectedSlug] : null;

  // Sidebar helpers
  const entityProductCount = (slug) => {
    const slugs = getSlugsUnder(slug, holdings);
    return products.filter(p => slugs.includes(p.companySlug) || (p.sharedWith && p.sharedWith.some(s => slugs.includes(s)))).length;
  };
  const brandProductCount = (slug) => products.filter(p => p.companySlug === slug || (p.sharedWith && p.sharedWith.includes(slug))).length;

  return (
    <div className="h-screen bg-[#F4F6FB] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-[#0F1B3D]/10 flex items-center px-6 shrink-0">
        <div className="w-[240px] flex items-center"><UsforceLogo size={24} /></div>
        <div className="flex-1 max-w-[420px] ml-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0F1B3D]/40"><Icn name="Search" size={14} /></span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produtos, códigos, empresas..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/10 focus:border-[#0F1B3D]/30 focus:bg-white outline-none transition-colors" />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-[#0F1B3D] text-white text-[11px] font-bold flex items-center justify-center shrink-0"
                 style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 75% 100%, 0 100%)' }}>
              {adminEmail ? adminEmail.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="hidden md:flex flex-col text-xs leading-tight">
              <span className="font-bold text-[#0F1B3D]">Administrador</span>
              <span className="text-[10px] tracking-wide text-[#0F1B3D]/50">{adminEmail || '—'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[240px] bg-white border-r border-[#0F1B3D]/10 flex flex-col shrink-0">
          <nav className="flex-1 p-3 overflow-y-auto">

            {/* Holdings header */}
            <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#0F1B3D]/40 px-1 pt-2 pb-2">Holdings</div>

            {holdings.map(h => (
              <div key={h.id} className="mb-2">
                {/* Holding row — dark blue button */}
                <div className="flex items-stretch gap-px">
                  <button
                    onClick={() => setExpandedHolding(s => ({ ...s, [h.id]: !s[h.id] }))}
                    className="flex-1 flex items-center gap-2 px-3 py-2.5 text-white font-bold uppercase tracking-[0.14em] transition-all min-w-0 hover:brightness-110 active:brightness-90"
                    style={{
                      background: expandedHolding[h.id] ? '#0F1B3D' : '#0E3A7A',
                      clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
                      fontSize: '11px',
                    }}>
                    <Icn name={expandedHolding[h.id] ? 'ChevronDown' : 'ChevronRight'} size={13} className="shrink-0" />
                    <span className="flex-1 text-left truncate">{h.name}</span>
                    <span className="shrink-0 text-[10px] opacity-50 font-normal">{h.companies.length}</span>
                  </button>
                  <button
                    onClick={() => openAddCompany(h.id)}
                    className="shrink-0 px-2.5 text-white/70 hover:text-white transition-colors"
                    style={{
                      background: expandedHolding[h.id] ? '#162444' : '#0E3A7A',
                    }}
                    title={`Adicionar empresa a ${h.name}`}>
                    <Icn name="Plus" size={12} />
                  </button>
                </div>

                {expandedHolding[h.id] && (
                  <div className="pl-3 space-y-0.5">
                    {h.companies.map(c => {
                      const hasBrands = c.brands && c.brands.length > 0;
                      const isCompSel = selectedSlug === c.slug;
                      const compExpanded = expandedCompany[c.slug];
                      const cnt = entityProductCount(c.slug);

                      return (
                        <div key={c.slug}>
                          {/* Company row */}
                          <div className={`flex items-center border-l-2 ${isCompSel ? 'border-[#0F1B3D]' : 'border-transparent'}`}>
                            {hasBrands ? (
                              <button onClick={() => setExpandedCompany(s => ({ ...s, [c.slug]: !s[c.slug] }))}
                                className="shrink-0 p-1.5 text-[#0F1B3D]/50 hover:text-[#0F1B3D]">
                                <Icn name={compExpanded ? 'ChevronDown' : 'ChevronRight'} size={11} />
                              </button>
                            ) : (
                              <span className="w-5 shrink-0" />
                            )}
                            <button onClick={() => setSelectedSlug(isCompSel ? null : c.slug)}
                              className={`flex-1 flex items-center gap-2 py-1.5 pr-1 text-[11px] min-w-0 transition-colors ${isCompSel ? 'bg-[#F4F6FB] text-[#0F1B3D] font-bold' : 'text-[#0F1B3D]/70 hover:bg-[#F4F6FB]/60'}`}>
                              <span className="flex-1 text-left truncate">{c.name}</span>
                              <span className="shrink-0 text-[9px] text-[#0F1B3D]/40">{cnt}</span>
                            </button>
                            <button onClick={() => openAddBrand(c.slug)} className="shrink-0 p-1.5 text-[#0F1B3D]/30 hover:text-[#0F1B3D] hover:bg-[#F4F6FB]" title={`Adicionar marca a ${c.name}`}>
                              <Icn name="Plus" size={10} />
                            </button>
                          </div>

                          {/* Brands */}
                          {hasBrands && compExpanded && (
                            <div className="pl-5 space-y-0.5 pb-1">
                              {c.brands.map(b => {
                                const isBrandSel = selectedSlug === b.slug;
                                const bCnt = brandProductCount(b.slug);
                                return (
                                  <button key={b.slug} onClick={() => setSelectedSlug(isBrandSel ? null : b.slug)}
                                    className={`w-full flex items-center gap-2 pl-3 pr-2 py-1.5 text-[10.5px] border-l-2 transition-colors ${isBrandSel ? 'border-[#0F1B3D] bg-[#F4F6FB] text-[#0F1B3D] font-bold' : 'border-transparent text-[#0F1B3D]/60 hover:border-[#0F1B3D]/25 hover:bg-[#F4F6FB]/60'}`}>
                                    <span className="h-1 w-1 rounded-full bg-current shrink-0 opacity-50" />
                                    <span className="flex-1 text-left truncate">{b.name}</span>
                                    <span className="shrink-0 text-[9px] text-[#0F1B3D]/40">{bCnt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="p-3 space-y-1.5 border-t border-[#0F1B3D]/10">
            {/* Nova Holding button */}
            <button
              onClick={() => setShowHoldingModal(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/90 hover:text-white transition-colors"
              style={{
                background: '#0E3A7A',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
              }}>
              <Icn name="Plus" size={13} /> Nova Holding
            </button>
            <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F1B3D]/70 hover:bg-[#F4F6FB]">
              <Icn name="LogOut" size={14} /> Sair
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-7">

            {/* Page header */}
            <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/50 mb-2 flex-wrap">
                  <span>USFORCE8</span><span>/</span><span>Painel</span>
                  {selectedEntity && (
                    <>
                      {selectedEntity.parentName && <><span>/</span><span>{selectedEntity.parentName}</span></>}
                      <span>/</span><span className="text-[#0F1B3D]">{selectedEntity.name}</span>
                    </>
                  )}
                </div>
                <h1 className="text-3xl font-black tracking-tight text-[#0F1B3D]"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  {selectedEntity ? selectedEntity.name : 'Visão Consolidada'}
                </h1>
                <p className="text-sm text-[#0F1B3D]/60 mt-1">
                  {selectedEntity
                    ? (selectedEntity.type === 'brand' ? `Marca · ${selectedEntity.parentName}` : 'Empresa · todos os produtos')
                    : 'Produtos de todas as marcas do conglomerado'}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedSlug && (
                  <GhostBtn
                    onClick={() => onNavigate({ view: 'public-showcase', selectedCompanySlug: selectedSlug })}
                    icon={<Icn name="ExternalLink" size={13} />}>
                    Ver Vitrine
                  </GhostBtn>
                )}
                <PrimaryBtn onClick={onNewProduct} icon={<Icn name="Plus" size={14} />}>Cadastrar Produto</PrimaryBtn>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Total de Produtos',   value: fmtNum(kpis.total),         icon: 'Package',   delta: '+3 esta semana' },
                { label: 'Empresas & Marcas',   value: fmtNum(kpis.totalEntities), icon: 'Building2', delta: 'em 2 holdings' },
              ].map(k => (
                <ChamferCard key={k.label} chamfer={14} className="bg-white border border-[#0F1B3D]/10 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/50">{k.label}</span>
                    <span className="flex items-center justify-center h-7 w-7 bg-[#F4F6FB] text-[#0F1B3D]">
                      <Icn name={k.icon} size={14} />
                    </span>
                  </div>
                  <div className="text-3xl font-black tracking-tight text-[#0F1B3D]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{k.value}</div>
                  <div className="text-[10px] uppercase tracking-[0.16em] mt-1 text-[#0F1B3D]/50">{k.delta}</div>
                </ChamferCard>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-white border border-[#0F1B3D]/10 mb-6">
              <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0F1B3D]/60 pr-2 border-r border-[#0F1B3D]/10 mr-1">
                  <Icn name="SlidersHorizontal" size={12} /> Filtros
                </div>
                <FilterSelect value={filterHolding} onChange={(v) => { setFilterHolding(v); setFilterEntity('all'); }} options={[
                  { v: 'all', l: 'Todas as Holdings' },
                  ...holdings.map(h => ({ v: h.id, l: h.name })),
                ]} />
                <FilterSelect value={filterEntity} onChange={(v) => { setFilterEntity(v); setFilterCategory('all'); }} options={[
                  { v: 'all', l: 'Empresa / Marca' },
                  ...filteredEntities,
                ]} />
                <FilterSelect value={filterCategory} onChange={setFilterCategory} options={[
                  { v: 'all', l: 'Todas as Categorias' },
                  ...availableCategories.map(c => ({ v: c, l: c })),
                ]} />
                <button onClick={() => { setFilterHolding('all'); setFilterEntity('all'); setFilterCategory('all'); setSearch(''); setSelectedSlug(null); }}
                  className="ml-auto text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F1B3D]/60 hover:text-[#0F1B3D]">
                  Limpar Tudo
                </button>
              </div>
            </div>

            {/* Product grid */}
            {filtered.length === 0 ? (
              <div className="bg-white border border-[#0F1B3D]/10 py-20 text-center">
                <Icn name="PackageX" size={32} className="mx-auto text-[#0F1B3D]/30" />
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[#0F1B3D]/60">Nenhum produto encontrado</p>
                <p className="text-xs text-[#0F1B3D]/50 mt-1">Ajuste os filtros ou cadastre um novo produto.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filtered.map(p => {
                  const e = entityMap[p.companySlug];
                  return e ? <AdminProductCard key={p.id} product={p} entity={e}
                    onEdit={() => onEditProduct(p)}
                    onView={() => onNavigate({ view: 'public-product-detail', selectedProductId: p.id, selectedCompanySlug: p.companySlug })}
                    onDelete={() => onDeleteProduct(p.id)} /> : null;
                })}
              </div>
            )}

            <p className="text-center text-[10px] uppercase tracking-[0.2em] text-[#0F1B3D]/30 mt-10">
              Exibindo {filtered.length} de {products.length} registros · USFORCE8 · {fmtDate('2026-05-06')}
            </p>
          </div>
        </main>
      </div>

      {/* ── Modal: Nova Holding ───────────────────────────────────────────── */}
      <Modal open={showHoldingModal} onClose={() => setShowHoldingModal(false)} icon="Building"
        title="Cadastrar Nova Holding" subtitle="Grupo empresarial de nível superior"
        footer={<>
          <button onClick={() => setShowHoldingModal(false)} className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F1B3D]/60 hover:text-[#0F1B3D] px-3">Cancelar</button>
          <PrimaryBtn onClick={submitHolding} icon={<Icn name="Check" size={13} />}>Cadastrar</PrimaryBtn>
        </>}>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/70 mb-1.5">Nome da Holding <span className="text-red-600">*</span></label>
            <input value={holdingForm.name} onChange={e => setHoldingForm(s => ({ ...s, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/15 focus:border-[#0F1B3D] focus:bg-white outline-none" placeholder="Ex.: Novo Grupo" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/70 mb-1.5">Tagline</label>
            <input value={holdingForm.tagline} onChange={e => setHoldingForm(s => ({ ...s, tagline: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/15 focus:border-[#0F1B3D] focus:bg-white outline-none" placeholder="Ex.: Grupo de Participações" />
          </div>
        </div>
      </Modal>

      {/* ── Modal: Nova Empresa ──────────────────────────────────────────── */}
      <Modal open={showCompanyModal} onClose={() => setShowCompanyModal(false)} icon="Building2"
        title="Cadastrar Nova Empresa" subtitle="Empresa dentro de uma holding"
        footer={<>
          <button onClick={() => setShowCompanyModal(false)} className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F1B3D]/60 hover:text-[#0F1B3D] px-3">Cancelar</button>
          <PrimaryBtn onClick={submitCompany} icon={<Icn name="Check" size={13} />}>Cadastrar</PrimaryBtn>
        </>}>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/70 mb-1.5">Holding</label>
            <select value={companyForm.holdingId} onChange={e => setCompanyForm(s => ({ ...s, holdingId: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/15 focus:border-[#0F1B3D] focus:bg-white outline-none">
              {holdings.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/70 mb-1.5">Nome <span className="text-red-600">*</span></label>
              <input value={companyForm.name} onChange={e => setCompanyForm(s => ({ ...s, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/15 focus:border-[#0F1B3D] focus:bg-white outline-none" placeholder="Ex.: Nova Empresa" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/70 mb-1.5">Tagline</label>
              <input value={companyForm.tagline} onChange={e => setCompanyForm(s => ({ ...s, tagline: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/15 focus:border-[#0F1B3D] focus:bg-white outline-none" placeholder="Ex.: Distribuidora" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/70 mb-1.5">Cor de Acento</label>
            <div className="flex items-center gap-2">
              <input type="color" value={companyForm.accent} onChange={e => setCompanyForm(s => ({ ...s, accent: e.target.value }))} className="h-10 w-16 border border-[#0F1B3D]/15 cursor-pointer" />
              <input value={companyForm.accent} onChange={e => setCompanyForm(s => ({ ...s, accent: e.target.value }))}
                className="flex-1 px-3 py-2 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/15 focus:border-[#0F1B3D] focus:bg-white outline-none font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/70 mb-1.5">Categorias Iniciais</label>
            <input value={companyForm.categories} onChange={e => setCompanyForm(s => ({ ...s, categories: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/15 focus:border-[#0F1B3D] focus:bg-white outline-none" placeholder="Separe por vírgula. Ex.: Frescos, Congelados" />
          </div>
        </div>
      </Modal>

      {/* ── Modal: Nova Marca ─────────────────────────────────────────────── */}
      <Modal open={showBrandModal} onClose={() => setShowBrandModal(false)} icon="Tag"
        title="Cadastrar Nova Marca" subtitle="Marca ou divisão dentro de uma empresa"
        footer={<>
          <button onClick={() => setShowBrandModal(false)} className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F1B3D]/60 hover:text-[#0F1B3D] px-3">Cancelar</button>
          <PrimaryBtn onClick={submitBrand} icon={<Icn name="Check" size={13} />}>Cadastrar</PrimaryBtn>
        </>}>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/70 mb-1.5">Empresa Pai</label>
            <select value={brandForm.companySlug} onChange={e => setBrandForm(s => ({ ...s, companySlug: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/15 focus:border-[#0F1B3D] focus:bg-white outline-none">
              <option value="">Selecione a empresa</option>
              {holdings.flatMap(h => h.companies.map(c => (
                <option key={c.slug} value={c.slug}>{h.name} → {c.name}</option>
              )))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/70 mb-1.5">Nome da Marca <span className="text-red-600">*</span></label>
              <input value={brandForm.name} onChange={e => setBrandForm(s => ({ ...s, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/15 focus:border-[#0F1B3D] focus:bg-white outline-none" placeholder="Ex.: Nova Marca" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/70 mb-1.5">Tagline</label>
              <input value={brandForm.tagline} onChange={e => setBrandForm(s => ({ ...s, tagline: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/15 focus:border-[#0F1B3D] focus:bg-white outline-none" placeholder="Ex.: Segmento Gourmet" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/70 mb-1.5">Cor de Acento</label>
            <div className="flex items-center gap-2">
              <input type="color" value={brandForm.accent} onChange={e => setBrandForm(s => ({ ...s, accent: e.target.value }))} className="h-10 w-16 border border-[#0F1B3D]/15 cursor-pointer" />
              <input value={brandForm.accent} onChange={e => setBrandForm(s => ({ ...s, accent: e.target.value }))}
                className="flex-1 px-3 py-2 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/15 focus:border-[#0F1B3D] focus:bg-white outline-none font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/70 mb-1.5">Categorias Iniciais</label>
            <input value={brandForm.categories} onChange={e => setBrandForm(s => ({ ...s, categories: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/15 focus:border-[#0F1B3D] focus:bg-white outline-none" placeholder="Separe por vírgula. Ex.: Premium, Clássico" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold text-[#0F1B3D] bg-[#F4F6FB] border border-[#0F1B3D]/10 hover:border-[#0F1B3D]/30 focus:border-[#0F1B3D] outline-none cursor-pointer">
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#0F1B3D]/40"><Icn name="ChevronDown" size={12} /></span>
    </div>
  );
}

function AdminProductCard({ product, entity, onEdit, onView, onDelete }) {
  const [confirmDel, setConfirmDel] = useStateAdmin(false);

  const handleDelete = () => {
    if (confirmDel) { onDelete(); }
    else {
      setConfirmDel(true);
      setTimeout(() => setConfirmDel(false), 3000);
    }
  };

  return (
    <ChamferCard chamfer={20} className="bg-white border border-[#0F1B3D]/10 hover:border-[#0F1B3D]/30 transition-colors flex flex-col">
      <ProductImage product={product} heightClass="h-64" />
      <div className="px-4 pt-4 pb-3 flex-1 flex flex-col">
        <div className="mb-2"><CompanyBadge company={entity} /></div>
        {entity.type === 'brand' && entity.parentName && (
          <div className="text-[9px] uppercase tracking-[0.16em] text-[#0F1B3D]/40 mb-1.5">{entity.parentName}</div>
        )}
        <h3 className="text-[15px] font-bold text-[#0F1B3D] leading-tight">{product.name}</h3>
        <p className="text-xs text-[#0F1B3D]/60 mt-1 line-clamp-2">{product.short}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <div className="uppercase tracking-[0.16em] text-[#0F1B3D]/40 font-bold">Unid./Cx</div>
            <div className="text-sm font-bold text-[#0F1B3D]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{product.unitsPerBox}</div>
          </div>
          <div>
            <div className="uppercase tracking-[0.16em] text-[#0F1B3D]/40 font-bold">Origem</div>
            <div className="text-xs font-bold text-[#0F1B3D] truncate">{product.origin}</div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-[#0F1B3D]/10 flex items-center justify-between text-[11px]">
        <span className="font-bold uppercase tracking-[0.16em] text-[#0F1B3D]/50">Cód: {product.code}</span>
        <div className="flex items-center gap-2">
          <button onClick={onView} className="text-[#0F1B3D]/60 hover:text-[#0F1B3D] flex items-center gap-1 font-bold uppercase tracking-[0.14em]">
            <Icn name="Eye" size={11} /> Ver
          </button>
          <button onClick={onEdit} className="text-[#1E5BC6] hover:text-[#0F1B3D] flex items-center gap-1 font-bold uppercase tracking-[0.14em]">
            <Icn name="Pencil" size={11} /> Editar
          </button>
          <button onClick={handleDelete}
            className={`flex items-center gap-1 font-bold uppercase tracking-[0.14em] transition-colors ${confirmDel ? 'text-red-600' : 'text-[#0F1B3D]/30 hover:text-red-500'}`}
            title={confirmDel ? 'Clique para confirmar' : 'Excluir produto'}>
            <Icn name={confirmDel ? 'Trash2' : 'Trash2'} size={11} />
            {confirmDel ? 'Confirmar?' : ''}
          </button>
        </div>
      </div>
    </ChamferCard>
  );
}

window.AdminView = AdminView;
