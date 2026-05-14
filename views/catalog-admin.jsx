// Gerenciador de Catálogos — USFORCE8
const { useState: useStateCatAdm, useRef: useRefCatAdm, useMemo: useMemoCA } = React;

function CatalogAdminView({
  entitySlug, entity, holdings, categories,
  catalogConfig, categoryCoverUrls, entityLogos,
  onSave, onSaveLogo, onPreview, onEditLayout, onBack,
}) {
  const { getSlugsUnder } = window.USFORCE_DATA;

  const brandList = useMemoCA(() => {
    for (const h of holdings) {
      for (const c of h.companies) {
        if (c.slug === entitySlug) return c.brands || [];
      }
    }
    return [];
  }, [entitySlug, holdings]);
  const isParentCompany = brandList.length > 0;

  const allCats = useMemoCA(() => {
    const slugs = getSlugsUnder(entitySlug, holdings);
    const out = [];
    slugs.forEach(s => (categories[s] || []).forEach(c => { if (!out.includes(c)) out.push(c); }));
    return out;
  }, [entitySlug, holdings, categories]);

  // Catalog config state
  const [coverUrl,           setCoverUrl]           = useStateCatAdm(catalogConfig?.coverUrl || '');
  const [backCoverUrl,       setBackCoverUrl]        = useStateCatAdm(catalogConfig?.backCoverUrl || '');
  const [catCovers,          setCatCovers]           = useStateCatAdm(categoryCoverUrls || {});
  const [showCategoryCovers, setShowCategoryCovers]  = useStateCatAdm(catalogConfig?.showCategoryCovers ?? true);
  const [showBrandDividers,  setShowBrandDividers]   = useStateCatAdm(catalogConfig?.showBrandDividers ?? true);
  const [uploading,          setUploading]           = useStateCatAdm(null);
  const [uploadErr,          setUploadErr]           = useStateCatAdm(null);
  const [saved,              setSaved]               = useStateCatAdm(false);

  const coverRef     = useRefCatAdm(null);
  const backCoverRef = useRefCatAdm(null);
  const catRefs      = useRefCatAdm({});

  const UPLOAD_URL = '/api/upload';
  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result.split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const deleteOldFile = async (oldUrl) => {
    if (!oldUrl) return;
    try {
      // Extract Dropbox path from URL — works for both direct and shared links
      const match = oldUrl.match(/\/USFORCE8\/[^?#]+/);
      if (!match) return;
      await fetch(UPLOAD_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: match[0] }),
      });
    } catch { /* silent — old file cleanup is best-effort */ }
  };

  const uploadFile = async (file, type, oldUrl) => {
    setUploading(type);
    setUploadErr(null);
    try {
      if (oldUrl) await deleteOldFile(oldUrl);
      const base64 = await toBase64(file);
      const resp = await fetch(UPLOAD_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, mimeType: file.type, data: base64, slug: `catalogos/${entitySlug}` }),
      });
      let result;
      try { result = await resp.json(); } catch { throw new Error(`Erro ${resp.status}`); }
      if (!resp.ok) throw new Error(result.error || `Erro ${resp.status}`);
      return result.url;
    } catch (err) { setUploadErr(err.message); return null; }
    finally { setUploading(null); }
  };

  const handleCoverFile   = async (e) => { const f = e.target.files?.[0]; if (!f) return; e.target.value=''; const u = await uploadFile(f,'cover',    coverUrl);     if (u) setCoverUrl(u); };
  const handleBackFile    = async (e) => { const f = e.target.files?.[0]; if (!f) return; e.target.value=''; const u = await uploadFile(f,'backcover', backCoverUrl); if (u) setBackCoverUrl(u); };
  const handleCatFile     = async (e, cat) => { const f = e.target.files?.[0]; if (!f) return; e.target.value=''; const u = await uploadFile(f, cat, catCovers[cat]); if (u) setCatCovers(c => ({ ...c, [cat]: u })); };

  const handleLogoFile = async (e, slug) => {
    const f = e.target.files?.[0]; if (!f) return; e.target.value='';
    const currentLogo = entityLogos?.[slug] || null;
    const u = await uploadFile(f, `logo-${slug}`, currentLogo);
    if (u && onSaveLogo) onSaveLogo(slug, u);
  };

  const handleSave = () => {
    onSave(entitySlug, { coverUrl, backCoverUrl, template:'moderno', showCategoryCovers, showBrandDividers }, catCovers);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  // ── Limpeza de órfãos do Dropbox ─────────────────────────────────────────────
  const [cleaning, setCleaning] = useStateCatAdm(false);
  const extractDbxPath = (url) => {
    if (!url) return null;
    const m = url.match(/\/USFORCE8\/[^?#]+/);
    return m ? m[0].toLowerCase() : null;
  };

  const handleCleanup = async () => {
    if (cleaning) return;
    const folder = `/USFORCE8/produtos/catalogos/${entitySlug}`;
    const used = new Set();
    [coverUrl, backCoverUrl].forEach(u => { const p = extractDbxPath(u); if (p) used.add(p); });
    Object.values(catCovers || {}).forEach(u => { const p = extractDbxPath(u); if (p) used.add(p); });
    const p1 = extractDbxPath(entityLogos?.[entitySlug]); if (p1) used.add(p1);
    brandList.forEach(b => { const p = extractDbxPath(entityLogos?.[b.slug]); if (p) used.add(p); });

    setCleaning(true);
    try {
      const r = await fetch(`${UPLOAD_URL}?folder=${encodeURIComponent(folder)}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `Erro ${r.status}`);
      const orphans = (data.files || []).filter(f => !used.has(f.path));
      if (!orphans.length) { alert('Nenhum arquivo órfão encontrado.'); return; }
      if (!confirm(`Apagar ${orphans.length} arquivo(s) não usado(s) do Dropbox?`)) return;
      let ok = 0, fail = 0;
      for (const f of orphans) {
        try {
          const res = await fetch(UPLOAD_URL, { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ path: f.path }) });
          if (res.ok) ok++; else fail++;
        } catch { fail++; }
      }
      alert(`Limpeza concluída: ${ok} apagado(s)${fail ? `, ${fail} falha(s)` : ''}.`);
    } catch (err) {
      setUploadErr(`Limpeza: ${err.message}`);
    } finally {
      setCleaning(false);
    }
  };

  const accent = entity?.accent || '#1A4A8C';

  const IcnA = ({ name, ...p }) => { const C = window.lucide[name]; return C ? <C {...p} /> : null; };

  function Toggle({ value, onChange, label, desc }) {
    return (
      <label className="flex items-start gap-4 cursor-pointer">
        <div className="relative shrink-0 mt-0.5">
          <input type="checkbox" className="sr-only" checked={value} onChange={e => onChange(e.target.checked)} />
          <div className={`w-10 h-5 rounded-full transition-colors ${value ? 'bg-[#0F1B3D]' : 'bg-[#0F1B3D]/20'}`} />
          <div className={`absolute top-0.5 left-0.5 h-4 w-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
        </div>
        <div>
          <div className="text-sm font-bold text-[#0F1B3D]">{label}</div>
          {desc && <div className="text-xs text-[#0F1B3D]/55 mt-0.5 leading-relaxed">{desc}</div>}
        </div>
      </label>
    );
  }

  function ImgZone({ imgUrl, onClear, onPickFile, loading, label, hint, ratio = '210/297' }) {
    return imgUrl ? (
      <div className="relative border border-[#0F1B3D]/15 overflow-hidden" style={{ aspectRatio: ratio }}>
        <img src={imgUrl} alt={label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
          <button onClick={onPickFile}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#0F1B3D] text-[11px] font-bold uppercase tracking-[0.16em]">
            <IcnA name="RefreshCw" size={12} /> Trocar
          </button>
        </div>
        <button onClick={onClear}
          className="absolute top-2 right-2 h-6 w-6 bg-black/60 hover:bg-black/80 flex items-center justify-center text-white">
          <IcnA name="X" size={12} />
        </button>
      </div>
    ) : (
      <button onClick={onPickFile} disabled={!!loading}
        className="w-full border-2 border-dashed border-[#0F1B3D]/20 hover:border-[#0F1B3D]/50 bg-[#F4F6FB] hover:bg-white transition-colors flex flex-col items-center justify-center gap-2 py-8 text-[#0F1B3D]/50 hover:text-[#0F1B3D] disabled:opacity-50"
        style={{ aspectRatio: ratio }}>
        {loading
          ? <><IcnA name="Loader" size={20} className="animate-spin" /><span className="text-[11px] font-bold uppercase tracking-[0.18em]">Enviando…</span></>
          : <><IcnA name="ImagePlus" size={22} /><span className="text-[11px] font-bold uppercase tracking-[0.18em]">Clique para enviar</span><span className="text-[10px]">{hint}</span></>
        }
      </button>
    );
  }

  function SectionHeader({ icon, title, desc }) {
    return (
      <div className="flex items-center gap-3 mb-5">
        <div className="h-8 w-8 flex items-center justify-center text-white shrink-0"
             style={{ background: accent, clipPath: 'polygon(0 0, 100% 0, 100% 70%, 75% 100%, 0 100%)' }}>
          <IcnA name={icon} size={14} />
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-[#0F1B3D]"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{title}</h2>
          <p className="text-xs text-[#0F1B3D]/60">{desc}</p>
        </div>
      </div>
    );
  }

  // Logo zone (16:9 ratio for logo previews)
  function LogoZone({ logoUrl, onPickFile, onClear, loading, label }) {
    return logoUrl ? (
      <div className="relative bg-[#F4F6FB] border border-[#0F1B3D]/15 overflow-hidden flex items-center justify-center p-3" style={{ aspectRatio:'3/1', minHeight:'64px' }}>
        <img src={logoUrl} alt={label} className="max-h-12 max-w-full object-contain" />
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 gap-2">
          <button onClick={onPickFile} className="px-3 py-1 bg-white text-[#0F1B3D] text-[10px] font-bold uppercase tracking-[0.14em]">
            <IcnA name="RefreshCw" size={10} className="inline mr-1" />Trocar
          </button>
        </div>
        <button onClick={onClear} className="absolute top-1.5 right-1.5 h-5 w-5 bg-black/50 hover:bg-black/70 flex items-center justify-center text-white">
          <IcnA name="X" size={10} />
        </button>
      </div>
    ) : (
      <button onClick={onPickFile} disabled={!!loading}
        className="w-full border-2 border-dashed border-[#0F1B3D]/20 hover:border-[#0F1B3D]/50 bg-[#F4F6FB] hover:bg-white transition-colors flex items-center justify-center gap-2 py-4 text-[#0F1B3D]/50 hover:text-[#0F1B3D] disabled:opacity-50"
        style={{ minHeight:'64px' }}>
        {loading
          ? <><IcnA name="Loader" size={16} className="animate-spin" /><span className="text-[10px] font-bold uppercase tracking-[0.16em]">Enviando…</span></>
          : <><IcnA name="ImagePlus" size={16} /><span className="text-[10px] font-bold uppercase tracking-[0.16em]">Enviar logo PNG/SVG</span></>
        }
      </button>
    );
  }

  return (
    <div className="h-screen bg-[#F4F6FB] flex flex-col overflow-hidden">

      {/* Header */}
      <header className="h-16 bg-white border-b border-[#0F1B3D]/10 flex items-center px-6 shrink-0">
        <button onClick={onBack}
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F1B3D]/70 hover:text-[#0F1B3D] mr-6">
          <IcnA name="ArrowLeft" size={14} /> Voltar
        </button>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 flex items-center justify-center text-white font-black text-sm"
               style={{ background: accent, clipPath: 'polygon(0 0, 100% 0, 100% 70%, 75% 100%, 0 100%)', fontFamily: "'Barlow Condensed', sans-serif" }}>
            {entity?.name?.slice(0,2).toUpperCase()}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/50">
              {isParentCompany ? 'Catálogo da Empresa' : 'Catálogo'}
            </div>
            <div className="text-base font-black uppercase tracking-tight text-[#0F1B3D]"
                 style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{entity?.name}</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {onEditLayout && (
            <GhostBtn onClick={onEditLayout} icon={<IcnA name="LayoutTemplate" size={14} />}>
              Editar Layout
            </GhostBtn>
          )}
          <GhostBtn onClick={handleCleanup} icon={<IcnA name={cleaning ? 'Loader' : 'Trash2'} size={14} className={cleaning ? 'animate-spin' : ''} />}>
            {cleaning ? 'Limpando…' : 'Limpar órfãos'}
          </GhostBtn>
          <GhostBtn onClick={onPreview} icon={<IcnA name="Eye" size={14} />}>Pré-visualizar</GhostBtn>
          <PrimaryBtn onClick={handleSave} icon={saved ? <IcnA name="Check" size={14} /> : <IcnA name="Save" size={14} />}>
            {saved ? 'Salvo!' : 'Salvar'}
          </PrimaryBtn>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8 space-y-10">

          {uploadErr && (
            <div className="bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <IcnA name="AlertCircle" size={16} /> {uploadErr}
              <button onClick={() => setUploadErr(null)} className="ml-auto"><IcnA name="X" size={14} /></button>
            </div>
          )}

          {/* ── Logotipos ───────────────────────────────────────────────────── */}
          <section>
            <SectionHeader icon="Award" title="Logotipos" desc="Exibido no cabeçalho de cada página de produto — PNG ou SVG transparente recomendado" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Logotipo da entidade principal */}
              <div className="bg-white border border-[#0F1B3D]/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-5 flex items-center justify-center text-white text-[9px] font-black shrink-0"
                       style={{ background: accent, clipPath: 'polygon(0 0, 100% 0, 100% 70%, 80% 100%, 0 100%)', fontFamily:"'Barlow Condensed', sans-serif" }}>
                    {entity?.name?.slice(0,2).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F1B3D]">{entity?.name}</span>
                  {entityLogos?.[entitySlug] && (
                    <span className="text-[9px] uppercase tracking-[0.15em] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5">Com logo</span>
                  )}
                </div>
                <input ref={el => { catRefs.current[`logo-${entitySlug}`] = el; }}
                  type="file" accept="image/*" className="hidden"
                  onChange={e => handleLogoFile(e, entitySlug)} />
                <LogoZone
                  logoUrl={entityLogos?.[entitySlug] || ''}
                  loading={uploading === `logo-${entitySlug}`}
                  label={entity?.name}
                  onClear={() => onSaveLogo && onSaveLogo(entitySlug, '')}
                  onPickFile={() => catRefs.current[`logo-${entitySlug}`]?.click()}
                />
              </div>

              {/* Logotipos das marcas (se empresa-mãe) */}
              {isParentCompany && brandList.map(brand => (
                <div key={brand.slug} className="bg-white border border-[#0F1B3D]/10 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-5 w-5 flex items-center justify-center text-white text-[9px] font-black shrink-0"
                         style={{ background: brand.accent || accent, clipPath: 'polygon(0 0, 100% 0, 100% 70%, 80% 100%, 0 100%)', fontFamily:"'Barlow Condensed', sans-serif" }}>
                      {brand.name.slice(0,2).toUpperCase()}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F1B3D]">{brand.name}</span>
                    {entityLogos?.[brand.slug] && (
                      <span className="text-[9px] uppercase tracking-[0.15em] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5">Com logo</span>
                    )}
                  </div>
                  <input ref={el => { catRefs.current[`logo-${brand.slug}`] = el; }}
                    type="file" accept="image/*" className="hidden"
                    onChange={e => handleLogoFile(e, brand.slug)} />
                  <LogoZone
                    logoUrl={entityLogos?.[brand.slug] || ''}
                    loading={uploading === `logo-${brand.slug}`}
                    label={brand.name}
                    onClear={() => onSaveLogo && onSaveLogo(brand.slug, '')}
                    onPickFile={() => catRefs.current[`logo-${brand.slug}`]?.click()}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ── Portada ──────────────────────────────────────────────────── */}
          <section>
            <SectionHeader icon="BookOpen" title="Portada do Catálogo" desc="Primeira página do PDF — formato A4 vertical" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} />
                <ImgZone imgUrl={coverUrl} loading={uploading === 'cover'} label="Portada"
                  hint="JPG, PNG · proporção A4 recomendada (794 × 1122 px)"
                  onClear={() => setCoverUrl('')} onPickFile={() => coverRef.current?.click()} />
                <p className="mt-2 text-[10px] text-[#0F1B3D]/45 uppercase tracking-[0.15em]">
                  Se vazio → gerado automaticamente com cores da marca
                </p>
              </div>
              <div className="flex flex-col justify-center gap-3 bg-white border border-[#0F1B3D]/10 p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/50 mb-1">Formato PDF</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#0F1B3D]" style={{ fontFamily:"'Barlow Condensed', sans-serif" }}>A4</span>
                  <span className="text-xs text-[#0F1B3D]/60">210 × 297 mm · Vertical</span>
                </div>
                <div className="text-[11px] text-[#0F1B3D]/60 leading-relaxed">
                  1 produto por página · Alta resolução (2×) · Exportação direta em PDF
                </div>
                {onEditLayout && (
                  <button onClick={onEditLayout}
                    className="mt-2 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] px-3 py-2 border border-[#0F1B3D]/20 text-[#0F1B3D]/70 hover:border-[#0F1B3D] hover:text-[#0F1B3D] transition-colors">
                    <IcnA name="LayoutTemplate" size={12} /> Personalizar layout dos produtos
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ── Opções de estrutura ───────────────────────────────────────── */}
          <section className="bg-white border border-[#0F1B3D]/10 p-6">
            <SectionHeader icon="Settings" title="Opções de Estrutura" desc="Defina quais páginas separadoras serão incluídas" />
            <div className="space-y-5">
              <Toggle
                value={showCategoryCovers}
                onChange={setShowCategoryCovers}
                label="Incluir separadores de categoria"
                desc="Uma página divisória (com ou sem imagem) antes dos produtos de cada categoria"
              />
              {isParentCompany && (
                <Toggle
                  value={showBrandDividers}
                  onChange={setShowBrandDividers}
                  label={`Incluir separadores de marca (${brandList.map(b => b.name).join(', ')})`}
                  desc="Página divisória antes dos produtos de cada marca — útil para catálogos multi-marca"
                />
              )}
            </div>
          </section>

          {/* ── Portadas de Marcas ────────────────────────────────────────── */}
          {isParentCompany && showBrandDividers && (
            <section>
              <SectionHeader icon="Tag" title="Portadas por Marca"
                desc={`Imagem de capa para cada marca de ${entity?.name}`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {brandList.map(brand => (
                  <div key={brand.slug} className="bg-white border border-[#0F1B3D]/10 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-5 w-5 flex items-center justify-center text-white text-[9px] font-black shrink-0"
                           style={{ background: brand.accent || accent, clipPath: 'polygon(0 0, 100% 0, 100% 70%, 80% 100%, 0 100%)', fontFamily:"'Barlow Condensed', sans-serif" }}>
                        {brand.name.slice(0,2).toUpperCase()}
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F1B3D]">{brand.name}</span>
                      {catCovers[`brand:${brand.slug}`] && (
                        <span className="text-[9px] uppercase tracking-[0.15em] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5">Com imagem</span>
                      )}
                    </div>
                    <input
                      ref={el => { catRefs.current[`brand:${brand.slug}`] = el; }}
                      type="file" accept="image/*" className="hidden"
                      onChange={e => handleCatFile(e, `brand:${brand.slug}`)}
                    />
                    <ImgZone
                      imgUrl={catCovers[`brand:${brand.slug}`] || ''}
                      loading={uploading === `brand:${brand.slug}`}
                      label={brand.name} hint="JPG, PNG · 794 × 1122 px"
                      onClear={() => setCatCovers(c => { const n={...c}; delete n[`brand:${brand.slug}`]; return n; })}
                      onPickFile={() => catRefs.current[`brand:${brand.slug}`]?.click()}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Portadas de Categorias ────────────────────────────────────── */}
          {showCategoryCovers && (
            <section>
              <SectionHeader icon="Layers" title="Portadas por Categoria"
                desc="Página separadora antes dos produtos de cada categoria" />
              {allCats.length === 0 ? (
                <div className="bg-white border border-[#0F1B3D]/10 py-10 text-center text-sm text-[#0F1B3D]/50">
                  Nenhuma categoria cadastrada para esta entidade.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {allCats.map(cat => (
                    <div key={cat} className="bg-white border border-[#0F1B3D]/10 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F1B3D]">{cat}</span>
                        {catCovers[cat] ? (
                          <span className="text-[9px] uppercase tracking-[0.15em] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5">Com imagem</span>
                        ) : (
                          <span className="text-[9px] uppercase tracking-[0.15em] text-[#0F1B3D]/40 font-bold bg-[#F4F6FB] px-2 py-0.5">Auto</span>
                        )}
                      </div>
                      <input ref={el => { catRefs.current[cat] = el; }} type="file" accept="image/*" className="hidden"
                        onChange={e => handleCatFile(e, cat)} />
                      <ImgZone imgUrl={catCovers[cat] || ''} loading={uploading === cat} label={cat}
                        hint="JPG, PNG · 794 × 1122 px"
                        onClear={() => setCatCovers(c => { const n={...c}; delete n[cat]; return n; })}
                        onPickFile={() => catRefs.current[cat]?.click()} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Contra-portada ────────────────────────────────────────────── */}
          <section>
            <SectionHeader icon="BookMarked" title="Contra-portada" desc="Última página do catálogo — opcional" />
            <div className="max-w-xs">
              <input ref={backCoverRef} type="file" accept="image/*" className="hidden" onChange={handleBackFile} />
              <ImgZone imgUrl={backCoverUrl} loading={uploading === 'backcover'} label="Contra-portada"
                hint="JPG, PNG · 794 × 1122 px"
                onClear={() => setBackCoverUrl('')} onPickFile={() => backCoverRef.current?.click()} />
              <p className="mt-2 text-[10px] text-[#0F1B3D]/45 uppercase tracking-[0.15em]">
                Se vazio → não será adicionada contra-portada
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
