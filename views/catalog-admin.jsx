// Gerenciador de Catálogos — USFORCE8
const { useState: useStateCatAdm, useRef: useRefCatAdm, useMemo: useMemoCA } = React;

function CatalogAdminView({
  entitySlug, entity, holdings, categories,
  catalogConfig, categoryCoverUrls,
  onSave, onPreview, onBack,
}) {
  const { getSlugsUnder } = window.USFORCE_DATA;

  // All categories relevant to this entity (brands included)
  const allCats = useMemoCA(() => {
    const slugs = getSlugsUnder(entitySlug, holdings);
    const out = [];
    slugs.forEach(s => (categories[s] || []).forEach(c => { if (!out.includes(c)) out.push(c); }));
    return out;
  }, [entitySlug, holdings, categories]);

  const [coverUrl,   setCoverUrl]   = useStateCatAdm(catalogConfig?.coverUrl || '');
  const [catCovers,  setCatCovers]  = useStateCatAdm(categoryCoverUrls || {});
  const [uploading,  setUploading]  = useStateCatAdm(null); // 'cover' | catName | null
  const [uploadErr,  setUploadErr]  = useStateCatAdm(null);
  const [saved,      setSaved]      = useStateCatAdm(false);

  const coverRef  = useRefCatAdm(null);
  const catRefs   = useRefCatAdm({});

  const UPLOAD_URL = '/api/upload';

  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result.split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const uploadFile = async (file, type) => {
    setUploading(type);
    setUploadErr(null);
    try {
      const base64 = await toBase64(file);
      const resp = await fetch(UPLOAD_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          data:     base64,
          slug:     `catalogos/${entitySlug}`,
        }),
      });
      let result;
      try { result = await resp.json(); } catch { throw new Error(`Erro ${resp.status}`); }
      if (!resp.ok) throw new Error(result.error || `Erro ${resp.status}`);
      return result.url;
    } catch (err) {
      setUploadErr(err.message);
      return null;
    } finally {
      setUploading(null);
    }
  };

  const handleCoverFile = async (e) => {
    const file = e.target.files?.[0]; if (!file) return; e.target.value = '';
    const url = await uploadFile(file, 'cover');
    if (url) setCoverUrl(url);
  };

  const handleCatFile = async (e, catName) => {
    const file = e.target.files?.[0]; if (!file) return; e.target.value = '';
    const url = await uploadFile(file, catName);
    if (url) setCatCovers(c => ({ ...c, [catName]: url }));
  };

  const handleSave = () => {
    onSave(entitySlug, { coverUrl, template: 'moderno' }, catCovers);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const accent = entity?.accent || '#1A4A8C';

  function ImgZone({ imgUrl, onClear, onPickFile, loading, label, hint }) {
    const IcoA = ({ n, ...p }) => { const C = window.lucide[n]; return C ? <C {...p} /> : null; };
    return imgUrl ? (
      <div className="relative border border-[#0F1B3D]/15 overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img src={imgUrl} alt={label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
          <button onClick={onPickFile}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#0F1B3D] text-[11px] font-bold uppercase tracking-[0.16em]">
            <IcoA n="RefreshCw" size={12} /> Trocar
          </button>
        </div>
        <button onClick={onClear}
          className="absolute top-2 right-2 h-6 w-6 bg-black/60 hover:bg-black/80 flex items-center justify-center text-white">
          <IcoA n="X" size={12} />
        </button>
      </div>
    ) : (
      <button onClick={onPickFile} disabled={!!loading}
        className="w-full border-2 border-dashed border-[#0F1B3D]/20 hover:border-[#0F1B3D]/50 bg-[#F4F6FB] hover:bg-white transition-colors flex flex-col items-center justify-center gap-2 py-8 text-[#0F1B3D]/50 hover:text-[#0F1B3D] disabled:opacity-50"
        style={{ aspectRatio: '16/9' }}>
        {loading
          ? <><IcoA n="Loader" size={20} className="animate-spin" /><span className="text-[11px] font-bold uppercase tracking-[0.18em]">Enviando…</span></>
          : <><IcoA n="ImagePlus" size={22} /><span className="text-[11px] font-bold uppercase tracking-[0.18em]">Clique para enviar</span><span className="text-[10px]">{hint}</span></>
        }
      </button>
    );
  }

  const IcnA = ({ name, ...p }) => { const C = window.lucide[name]; return C ? <C {...p} /> : null; };

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
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/50">Catálogo</div>
            <div className="text-base font-black uppercase tracking-tight text-[#0F1B3D]"
                 style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{entity?.name}</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
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

          {/* Portada do catálogo */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-8 w-8 flex items-center justify-center text-white"
                   style={{ background: accent, clipPath: 'polygon(0 0, 100% 0, 100% 70%, 75% 100%, 0 100%)' }}>
                <IcnA name="BookOpen" size={14} />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-[#0F1B3D]"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Portada do Catálogo</h2>
                <p className="text-xs text-[#0F1B3D]/60">Imagem de capa — primeira página do PDF</p>
              </div>
            </div>
            <div className="max-w-xl">
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} />
              <ImgZone
                imgUrl={coverUrl}
                loading={uploading === 'cover'}
                label="Portada"
                hint="JPG, PNG · recomendado 1240 × 698 px"
                onClear={() => setCoverUrl('')}
                onPickFile={() => coverRef.current?.click()}
              />
              <p className="mt-2 text-[10px] text-[#0F1B3D]/50 uppercase tracking-[0.15em]">
                Se vazio, será gerado automaticamente com as cores da marca
              </p>
            </div>
          </section>

          {/* Portadas de Categorias */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-8 w-8 flex items-center justify-center text-white"
                   style={{ background: accent, clipPath: 'polygon(0 0, 100% 0, 100% 70%, 75% 100%, 0 100%)' }}>
                <IcnA name="Layers" size={14} />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-[#0F1B3D]"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Portadas por Categoria</h2>
                <p className="text-xs text-[#0F1B3D]/60">Página separadora antes dos produtos de cada categoria</p>
              </div>
            </div>

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
                      {catCovers[cat] && (
                        <span className="text-[9px] uppercase tracking-[0.15em] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5">Com imagem</span>
                      )}
                    </div>
                    <input
                      ref={el => { catRefs.current[cat] = el; }}
                      type="file" accept="image/*" className="hidden"
                      onChange={e => handleCatFile(e, cat)}
                    />
                    <ImgZone
                      imgUrl={catCovers[cat] || ''}
                      loading={uploading === cat}
                      label={cat}
                      hint="JPG, PNG · recomendado 1240 × 698 px"
                      onClear={() => setCatCovers(c => { const n = { ...c }; delete n[cat]; return n; })}
                      onPickFile={() => catRefs.current[cat]?.click()}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Info Template */}
          <section className="bg-white border border-[#0F1B3D]/10 p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 flex items-center justify-center text-white"
                   style={{ background: accent, clipPath: 'polygon(0 0, 100% 0, 100% 70%, 75% 100%, 0 100%)' }}>
                <IcnA name="Layout" size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-[#0F1B3D]"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Template Moderno</h3>
                <p className="text-xs text-[#0F1B3D]/60 mt-1 leading-relaxed">
                  Cada produto ocupa uma página A4 inteira. Foto à esquerda (50%), painel com cor da marca à direita (50%).
                  Inclui nome do produto, 5 estrelas, código, origem, embalagem e descrição.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F1B3D]/50">Estrutura:</span>
                  {['Portada', 'Separador', 'Produto × N', 'Separador', '…'].map((s, i) => (
                    <span key={i} className="text-[10px] font-bold uppercase tracking-[0.14em] text-white px-2 py-0.5"
                          style={{ background: i % 2 === 0 ? accent : '#0F1B3D' }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
