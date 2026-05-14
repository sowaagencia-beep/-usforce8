// Formulário de Produto — USFORCE8 (hierarquia 3 níveis + sharedWith)

const { useState: useStateForm, useMemo: useMemoForm, useRef: useRefForm } = React;

function I({ name, ...p }) { const C = window.lucide[name]; return C ? <C {...p} /> : null; }

function ProductFormView({ initialProduct, holdings, categories, categoryColors, onCancel, onSave, onLogout, onAddCategory, onDeleteCategory, onSetCategoryColor }) {
  const { buildEntityMap, getAllEntities } = window.USFORCE_DATA;

  // Build entity map once
  const entityMap = useMemoForm(() => buildEntityMap(holdings), [holdings]);
  const allEntities = useMemoForm(() => getAllEntities(holdings), [holdings]);

  const isEdit = !!initialProduct;

  // Derive initial hierarchy from initialProduct.companySlug
  const initSlug = initialProduct?.companySlug || '';
  const initEntity = initSlug ? entityMap[initSlug] : null;
  const initCompanySlug  = initEntity?.type === 'brand' ? initEntity.parentSlug : initSlug;
  const initHoldingId    = initEntity ? initEntity.holdingId : '';

  const [form, setForm] = useStateForm({
    holdingId:    initHoldingId,
    compSel:      initCompanySlug,  // which company is selected in step 2 (intermediate)
    companySlug:  initSlug,          // final owner slug (brand or company)
    category:     initialProduct?.category || '',
    name:         initialProduct?.name || '',
    code:         initialProduct?.code || `USF-${Math.floor(Math.random()*9000+1000)}`,
    short:        initialProduct?.short || '',
    long:         initialProduct?.long || '',
    unitsPerBox:  (initialProduct?.unitsPerBox && initialProduct.unitsPerBox > 0) ? initialProduct.unitsPerBox : 12,
    variableUnits: initialProduct?.unitsPerBox === 0,
    origin:       initialProduct?.origin || 'Brasil',
    active:       initialProduct?.active ?? true,
    images:       initialProduct?.images || [],
    sharedWith:   initialProduct?.sharedWith || [],
  });
  const [errors, setErrors]       = useStateForm({});
  const [uploading, setUploading] = useStateForm(false);
  const [uploadErr, setUploadErr] = useStateForm(null);
  const fileInputRef = useRefForm(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Derived selectors
  const availableCompanies = form.holdingId
    ? (holdings.find(h => h.id === form.holdingId)?.companies || [])
    : [];

  const selectedCompanyObj = form.compSel
    ? availableCompanies.find(c => c.slug === form.compSel)
    : null;

  const availableBrands = selectedCompanyObj?.brands || [];
  const hasBrands = availableBrands.length > 0;

  // Categories come from the final assigned entity (brand or company)
  const availableCategories = form.companySlug
    ? (categories[form.companySlug] || [])
    : [];

  const validate = () => {
    const e = {};
    if (!form.holdingId)      e.holdingId   = 'Campo obrigatório';
    if (!form.compSel)        e.compSel     = 'Campo obrigatório';
    if (!form.companySlug)    e.companySlug = 'Campo obrigatório';
    if (!form.category)       e.category    = 'Campo obrigatório';
    if (!form.name?.trim())   e.name        = 'Campo obrigatório';
    if (!form.short?.trim())  e.short       = 'Campo obrigatório';
    if (Number(form.unitsPerBox) < 1) e.unitsPerBox = 'Mínimo 1';
    if (!form.origin?.trim()) e.origin      = 'Campo obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (publish) => {
    if (publish && !validate()) return;
    const product = {
      id:          initialProduct?.id || `PRD-${Math.floor(Math.random()*9000+1000)}`,
      companySlug: form.companySlug,
      category:    form.category,
      name:        form.name,
      code:        form.code,
      short:       form.short,
      long:        form.long || form.short,
      unitsPerBox: form.variableUnits ? 0 : (Number(form.unitsPerBox) || 1),
      origin:      form.origin,
      active:      form.active,
      sharedWith:  form.sharedWith,
      createdAt:   initialProduct?.createdAt || '2026-05-06',
      images:      form.images.length ? form.images : [
        `https://placehold.co/800x600/0F1B3D/E8EEF7?text=${encodeURIComponent(form.name || 'Novo Produto')}&font=montserrat`,
      ],
    };
    onSave(product, publish);
  };

  const previewProduct = {
    name:        form.name || 'Nome do Produto',
    short:       form.short || 'Resumo curto do produto aparecerá aqui.',
    code:        form.code,
    companySlug: form.companySlug || (holdings[0]?.companies[0]?.brands?.[0]?.slug || holdings[0]?.companies[0]?.slug),
    images:      form.images.length ? form.images : [`https://placehold.co/800x600/0F1B3D/E8EEF7?text=${encodeURIComponent(form.name || 'Pré-visualização')}&font=montserrat`],
    unitsPerBox: Number(form.unitsPerBox) || 0,
    origin:      form.origin || '—',
  };
  const previewEntity = entityMap[previewProduct.companySlug] || { name: 'Empresa', tagline: '' };

  // Entities available for sharedWith (all except the current owner)
  const sharedWithOptions = allEntities.filter(e => e.slug !== form.companySlug);

  const toggleShared = (slug) => {
    set('sharedWith', form.sharedWith.includes(slug)
      ? form.sharedWith.filter(s => s !== slug)
      : [...form.sharedWith, slug]);
  };

  // Express serve /api/upload tanto local quanto no Render
  const UPLOAD_URL = '/api/upload';

  // Converte File → base64
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = '';

    setUploadErr(null);
    setUploading(true);
    try {
      for (const file of files) {
        const canAdd = await new Promise(resolve =>
          setForm(f => { resolve(f.images.length < 8); return f; })
        );
        if (!canAdd) break;

        const base64 = await toBase64(file);

        const res = await fetch(UPLOAD_URL, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
            data:     base64,
            slug:     form.companySlug || 'geral',
          }),
        });

        let result;
        try { result = await res.json(); }
        catch { throw new Error(`Servidor retornou erro ${res.status}`); }

        if (!res.ok) throw new Error(result.error || `Erro ${res.status}`);

        setForm(f => ({
          ...f,
          images: f.images.length < 8 ? [...f.images, result.url] : f.images,
        }));
      }
    } catch (err) {
      setUploadErr(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (idx) => {
    set('images', form.images.filter((_, j) => j !== idx));
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col">
      <header className="h-14 bg-white border-b border-[#0F1B3D]/10 flex items-center px-6 shrink-0">
        <UsforceLogo size={22} />
        <div className="ml-auto flex items-center gap-3">
          <button onClick={onCancel} className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F1B3D]/60 hover:text-[#0F1B3D]">Cancelar Cadastro</button>
          <div className="h-6 w-px bg-[#0F1B3D]/10" />
          <button onClick={onLogout} className="text-[#0F1B3D]/60 hover:text-[#0F1B3D]"><I name="LogOut" size={14} /></button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_520px]">
        <div className="overflow-y-auto">
          <div className="px-8 py-7">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/50 mb-2">
              <span>USFORCE8</span><span>/</span><span>Produtos</span><span>/</span>
              <span className="text-[#0F1B3D]">{isEdit ? 'Editar' : 'Cadastrar'}</span>
            </div>
            <h1 className="text-3xl font-black text-[#0F1B3D] tracking-tight"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              {isEdit ? 'Editar Produto' : 'Cadastrar Novo Produto'}
            </h1>
            <p className="text-sm text-[#0F1B3D]/60 mt-1">Configure detalhes, embalagem e mídias. Pré-visualização ao lado.</p>

            {/* ── Hierarquia ─────────────────────────────────────────────── */}
            <Section icon="Network" title="Hierarquia de Atribuição" subtitle="Holding · Empresa · Marca · Categoria">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Holding */}
                <Field label="Holding" required error={errors.holdingId}>
                  <SelectInput value={form.holdingId} onChange={(v) => { set('holdingId', v); set('compSel', ''); set('companySlug', ''); set('category', ''); }}>
                    <option value="">Selecione a holding</option>
                    {holdings.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </SelectInput>
                </Field>

                {/* Empresa */}
                <Field label="Empresa" required error={errors.compSel}>
                  <SelectInput value={form.compSel} onChange={(v) => { set('compSel', v); set('companySlug', v); set('category', ''); }} disabled={!form.holdingId}>
                    <option value="">Selecione a empresa</option>
                    {availableCompanies.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </SelectInput>
                </Field>

                {/* Marca (somente se empresa tiver marcas) */}
                {hasBrands && (
                  <Field label="Marca" required error={errors.companySlug}>
                    <SelectInput
                      value={form.companySlug === form.compSel ? '' : form.companySlug}
                      onChange={(v) => { set('companySlug', v || form.compSel); set('category', ''); }}
                      disabled={!form.compSel}>
                      <option value="">Produto direto da empresa</option>
                      {availableBrands.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
                    </SelectInput>
                  </Field>
                )}

                {/* Categoria */}
                <div className="md:col-span-2">
                  <Field label="Categoria" required error={errors.category}>
                    {!form.companySlug ? (
                      <div className="px-3 py-2.5 text-xs text-[#0F1B3D]/40 bg-[#F4F6FB] border border-[#0F1B3D]/15">
                        Selecione uma empresa ou marca primeiro
                      </div>
                    ) : (
                      <CategoryManager
                        categories={availableCategories}
                        colors={categoryColors?.[form.companySlug] || {}}
                        selected={form.category}
                        onSelect={v => set('category', v)}
                        onAdd={name => onAddCategory(form.companySlug, name)}
                        onDelete={name => { onDeleteCategory(form.companySlug, name); if (form.category === name) set('category', ''); }}
                        onSetColor={(name, color) => onSetCategoryColor && onSetCategoryColor(form.companySlug, name, color)}
                      />
                    )}
                  </Field>
                </div>
              </div>
            </Section>

            {/* ── Informações ────────────────────────────────────────────── */}
            <Section icon="FileText" title="Informações do Produto" subtitle="Nome, código e descrição">
              <Field label="Nome do Produto" required error={errors.name}>
                <TextInput value={form.name} onChange={(v) => set('name', v)} placeholder="Ex.: Salmão Fresco Premium 1kg" />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Field label="Código">
                  <TextInput value={form.code} onChange={(v) => set('code', v)} placeholder="USF-1024" />
                </Field>
                <Field label="Descrição Curta" required error={errors.short}>
                  <TextInput value={form.short} onChange={(v) => set('short', v)} placeholder="Resumo breve para listagens" />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Descrição Detalhada">
                  <div className="border border-[#0F1B3D]/15 bg-white">
                    <div className="flex items-center gap-3 px-3 py-1.5 border-b border-[#0F1B3D]/10 text-[#0F1B3D]/50">
                      <I name="Bold" size={13} /><I name="Italic" size={13} /><I name="List" size={13} /><I name="Link" size={13} />
                    </div>
                    <textarea value={form.long} onChange={(e) => set('long', e.target.value)} rows={5}
                      placeholder="Especificações detalhadas, materiais, características..."
                      className="w-full px-3 py-2.5 text-sm bg-white outline-none resize-none" />
                  </div>
                </Field>
              </div>
            </Section>

            {/* ── Embalagem ──────────────────────────────────────────────── */}
            <Section icon="Boxes" title="Embalagem e Origem" subtitle="Unidades por caixa · país de origem">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Unidades por Caixa" required={!form.variableUnits} error={errors.unitsPerBox}>
                  <div className="space-y-2">
                    {/* Toggle variável por peso */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <button type="button" onClick={() => set('variableUnits', !form.variableUnits)}
                        className={`relative h-5 w-9 shrink-0 transition-colors ${form.variableUnits ? 'bg-[#0F1B3D]' : 'bg-[#0F1B3D]/20'}`}>
                        <span className={`absolute top-0.5 h-4 w-4 bg-white transition-all ${form.variableUnits ? 'left-[18px]' : 'left-0.5'}`} />
                      </button>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0F1B3D]/70">Variável (por peso)</span>
                    </label>
                    {form.variableUnits ? (
                      <div className="px-3 py-2 bg-[#F4F6FB] border border-[#0F1B3D]/15 text-sm text-[#0F1B3D]/60 italic">
                        Depende do peso
                      </div>
                    ) : (
                      <TextInput type="number" value={form.unitsPerBox} onChange={(v) => set('unitsPerBox', v)} placeholder="12" />
                    )}
                  </div>
                </Field>
                <Field label="País de Origem" required error={errors.origin}>
                  <TextInput value={form.origin} onChange={(v) => set('origin', v)} placeholder="Ex.: Brasil" />
                </Field>
              </div>
            </Section>

            {/* ── Disponibilidade adicional ──────────────────────────────── */}
            <Section icon="Share2" title="Disponibilidade Adicional"
              subtitle="Vitrines de outras empresas onde este produto também aparece">
              {sharedWithOptions.length === 0 ? (
                <p className="text-xs text-[#0F1B3D]/50">Nenhuma outra entidade disponível.</p>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {sharedWithOptions.map(e => (
                    <label key={e.slug} className="flex items-center gap-3 px-3 py-2.5 bg-[#F4F6FB] hover:bg-[#EEF2F9] cursor-pointer border border-transparent hover:border-[#0F1B3D]/10 transition-colors">
                      <input type="checkbox" checked={form.sharedWith.includes(e.slug)}
                        onChange={() => toggleShared(e.slug)}
                        className="h-4 w-4 accent-[#0F1B3D] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-[#0F1B3D] truncate">{e.name}</div>
                        <div className="text-[10px] uppercase tracking-[0.14em] text-[#0F1B3D]/50">
                          {e.type === 'brand' ? `Marca · ${e.parentName} · ` : 'Empresa · '}{e.holdingName}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {form.sharedWith.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {form.sharedWith.map(slug => {
                    const ent = entityMap[slug];
                    return ent ? (
                      <span key={slug} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0F1B3D] text-white text-[10px] font-bold uppercase tracking-[0.14em]">
                        {ent.name}
                        <button type="button" onClick={() => toggleShared(slug)} className="opacity-60 hover:opacity-100">
                          <I name="X" size={10} />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </Section>

            {/* ── Imagens ────────────────────────────────────────────────── */}
            <Section icon="ImagePlus" title="Imagens do Produto" subtitle="Salvas no Dropbox · até 8 imagens">
              {/* Input file oculto — aceita múltiplos */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />

              <div className="grid grid-cols-4 gap-3">
                {form.images.slice(0, 8).map((img, idx) => (
                  <div key={idx} className="relative aspect-square border border-[#0F1B3D]/15 overflow-hidden bg-[#0F1B3D]">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 h-6 w-6 bg-white/90 hover:bg-white flex items-center justify-center text-[#0F1B3D] transition-colors">
                      <I name="X" size={12} />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 text-[8px] font-bold uppercase tracking-[0.14em] bg-black/60 text-white px-1.5 py-0.5">
                        Principal
                      </span>
                    )}
                  </div>
                ))}

                {/* Botão de upload */}
                {form.images.length < 8 && (
                  <button
                    type="button"
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    disabled={uploading}
                    className={`aspect-square border border-dashed flex flex-col items-center justify-center gap-1.5 transition-colors
                      ${uploading
                        ? 'border-[#0F1B3D]/20 bg-[#0F1B3D]/5 cursor-wait'
                        : 'border-[#0F1B3D]/25 hover:border-[#0F1B3D] hover:bg-[#0F1B3D]/5 text-[#0F1B3D]/60 hover:text-[#0F1B3D]'
                      }`}>
                    {uploading ? (
                      <>
                        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        <span className="text-[9px] font-bold uppercase tracking-[0.16em]">Enviando…</span>
                      </>
                    ) : (
                      <>
                        <I name="Upload" size={18} />
                        <span className="text-[9px] font-bold uppercase tracking-[0.16em]">Adicionar</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Mensagem de erro de upload */}
              {uploadErr && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  <I name="AlertCircle" size={13} />
                  {uploadErr}
                  <button type="button" onClick={() => setUploadErr(null)} className="ml-auto opacity-60 hover:opacity-100">
                    <I name="X" size={11} />
                  </button>
                </div>
              )}

              <p className="mt-2.5 text-[10px] text-[#0F1B3D]/40 flex items-center gap-1.5">
                <I name="Cloud" size={11} />
                Imagens salvas em <span className="font-semibold">Dropbox / USFORCE8 / produtos / {form.companySlug || '…'}</span>
              </p>
            </Section>

            {/* ── Visibilidade ───────────────────────────────────────────── */}
            <Section icon="ToggleRight" title="Visibilidade" subtitle="Controle de publicação">
              <label className="flex items-center justify-between p-4 bg-white border border-[#0F1B3D]/10 cursor-pointer">
                <div>
                  <div className="text-sm font-bold text-[#0F1B3D]">Produto Ativo</div>
                  <div className="text-xs text-[#0F1B3D]/60 mt-0.5">Quando ativo, o produto aparece nas vitrines públicas.</div>
                </div>
                <button type="button" onClick={() => set('active', !form.active)}
                  className={`relative h-6 w-11 transition-colors ${form.active ? 'bg-[#0F1B3D]' : 'bg-[#0F1B3D]/20'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 bg-white transition-all ${form.active ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </label>
            </Section>

            <div className="h-24" />
          </div>

          <div className="sticky bottom-0 bg-white border-t border-[#0F1B3D]/15 px-8 py-4 flex items-center justify-between">
            <button onClick={onCancel} className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F1B3D]/60 hover:text-[#0F1B3D]">Cancelar</button>
            <div className="flex items-center gap-3">
              <GhostBtn onClick={() => handleSubmit(false)} icon={<I name="FileDown" size={13} />}>Salvar Rascunho</GhostBtn>
              <PrimaryBtn onClick={() => handleSubmit(true)} icon={<I name="Send" size={13} />}>Publicar</PrimaryBtn>
            </div>
          </div>
        </div>

        {/* Preview */}
        <aside className="bg-[#EEF2F9] border-l border-[#0F1B3D]/10 hidden lg:flex flex-col">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/60">
              <I name="Eye" size={12} /> Pré-visualização ao Vivo
            </div>
            <span className="text-[9px] uppercase tracking-[0.18em] text-[#0F1B3D]/40">vitrine</span>
          </div>
          <div className="px-5 pb-5 flex-1 overflow-y-auto">
            <ChamferCard chamfer={20} className="bg-white border border-[#0F1B3D]/10">
              <ProductImage product={previewProduct} heightClass="h-72" />
              <div className="px-4 pt-4 pb-4">
                <CompanyBadge company={previewEntity} />
                {previewEntity.type === 'brand' && previewEntity.parentName && (
                  <div className="text-[9px] uppercase tracking-[0.16em] text-[#0F1B3D]/40 mt-1">{previewEntity.parentName}</div>
                )}
                <h3 className="mt-2 text-base font-bold text-[#0F1B3D] leading-tight">{previewProduct.name}</h3>
                <p className="text-xs text-[#0F1B3D]/60 mt-1 line-clamp-3">{previewProduct.short}</p>
                <div className="mt-3 pt-3 border-t border-[#0F1B3D]/10 grid grid-cols-3 gap-2">
                  <Stat label="Cód." value={previewProduct.code} />
                  <Stat label="Unid./Cx" value={previewProduct.unitsPerBox} />
                  <Stat label="Origem" value={previewProduct.origin} />
                </div>
              </div>
            </ChamferCard>
            <div className="mt-5 text-[10px] uppercase tracking-[0.2em] text-[#0F1B3D]/50 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" /> Atualiza conforme você digita
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.18em] text-[#0F1B3D]/40 font-bold">{label}</div>
      <div className="text-xs font-bold text-[#0F1B3D] truncate">{value}</div>
    </div>
  );
}

function Section({ icon, title, subtitle, children }) {
  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <I name={icon} size={14} className="text-[#0F1B3D]" />
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#0F1B3D]">{title}</h2>
        {subtitle && <span className="text-[10px] uppercase tracking-[0.16em] text-[#0F1B3D]/40">· {subtitle}</span>}
      </div>
      <div className="bg-white border border-[#0F1B3D]/10 p-5">{children}</div>
    </section>
  );
}

function Field({ label, required, error, children }) {
  return (
    <label className="block">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]/70 mb-1.5">
        {label} {required && <span className="text-red-600">*</span>}
      </div>
      {children}
      {error && <div className="text-[10px] text-red-600 mt-1 font-semibold">{error}</div>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/15 focus:border-[#0F1B3D] focus:bg-white outline-none transition-colors" />
  );
}

function SelectInput({ value, onChange, children, disabled }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        className="w-full appearance-none px-3 pr-8 py-2 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/15 focus:border-[#0F1B3D] focus:bg-white outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
        {children}
      </select>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#0F1B3D]/40"><I name="ChevronDown" size={14} /></span>
    </div>
  );
}

function CategoryManager({ categories, colors = {}, selected, onSelect, onAdd, onDelete, onSetColor }) {
  const [newCat,      setNewCat]      = useStateForm('');
  const [delConfirm,  setDelConfirm]  = useStateForm(null);
  const [colorEdit,   setColorEdit]   = useStateForm(null); // { cat, value }
  const colorRefs = React.useRef({});

  const parseColor = (val) => {
    val = (val || '').trim();
    if (!val) return null;
    if (/^#[0-9a-fA-F]{6}$/.test(val)) return val.toLowerCase();
    if (/^#[0-9a-fA-F]{3}$/.test(val)) return '#' + val.slice(1).split('').map(c => c+c).join('').toLowerCase();
    if (/^[0-9a-fA-F]{6}$/.test(val)) return '#' + val.toLowerCase();
    const m = val.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (m) return '#' + [m[1],m[2],m[3]].map(n => Math.min(255, parseInt(n)).toString(16).padStart(2,'0')).join('');
    return null;
  };

  const openColor = (cat) => setColorEdit({ cat, value: colors[cat] || '#1A4A8C' });
  const applyColor = () => {
    if (!colorEdit) return;
    const parsed = parseColor(colorEdit.value);
    if (!parsed) { alert('Cor inválida. Use formato #RRGGBB ou rgb(r,g,b)'); return; }
    onSetColor(colorEdit.cat, parsed);
    setColorEdit(null);
  };

  const handleAdd = () => {
    const name = newCat.trim();
    if (!name || categories.includes(name)) return;
    onAdd(name);
    setNewCat('');
  };

  const handleDelete = (name) => {
    if (delConfirm === name) {
      onDelete(name);
      setDelConfirm(null);
    } else {
      setDelConfirm(name);
      setTimeout(() => setDelConfirm(c => c === name ? null : c), 3000);
    }
  };

  return (
    <div className="space-y-3">
      {/* Chips existentes */}
      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const catColor = colors[cat] || null;
            return (
              <div key={cat}
                className={`group inline-flex items-center text-[11px] font-bold uppercase tracking-[0.14em] border transition-colors
                  ${selected === cat
                    ? 'bg-[#0F1B3D] text-white border-[#0F1B3D]'
                    : 'bg-[#F4F6FB] text-[#0F1B3D] border-[#0F1B3D]/20 hover:border-[#0F1B3D]/50'}`}>
                {onSetColor && (
                  <button type="button" title="Cor da categoria (hex ou rgb)"
                    onClick={(e) => { e.stopPropagation(); openColor(cat); }}
                    className="pl-2 py-1.5 flex items-center">
                    <span className="h-3 w-3 rounded-full border border-current/30"
                          style={{ background: catColor || 'transparent', borderColor: catColor ? 'rgba(0,0,0,0.2)' : 'currentColor' }} />
                  </button>
                )}
                <button type="button" onClick={() => onSelect(cat)} className="px-3 py-1.5">
                  {cat}
                </button>
                <button type="button" onClick={() => handleDelete(cat)}
                  className={`pr-2.5 pl-1 py-1.5 transition-colors
                    ${delConfirm === cat
                      ? 'text-red-500 opacity-100'
                      : selected === cat
                        ? 'opacity-40 hover:opacity-100'
                        : 'opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:text-red-500'}`}>
                  <I name={delConfirm === cat ? 'Trash2' : 'X'} size={10} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-[#0F1B3D]/40 italic">Nenhuma categoria ainda — crie a primeira abaixo.</p>
      )}

      {/* Editor de cor inline */}
      {colorEdit && (
        <div className="bg-[#F4F6FB] border border-[#0F1B3D]/15 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0F1B3D]/70">
              Cor de "{colorEdit.cat}"
            </span>
            <button type="button" onClick={() => setColorEdit(null)} className="text-[#0F1B3D]/50 hover:text-[#0F1B3D]"><I name="X" size={12} /></button>
          </div>
          <div className="flex items-center gap-2">
            <input type="color" value={parseColor(colorEdit.value) || '#1A4A8C'}
              onChange={e => setColorEdit({ ...colorEdit, value: e.target.value })}
              className="h-9 w-12 cursor-pointer border border-[#0F1B3D]/15" />
            <input type="text" value={colorEdit.value}
              onChange={e => setColorEdit({ ...colorEdit, value: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyColor(); } }}
              placeholder="#RRGGBB ou rgb(r,g,b)"
              className="flex-1 px-3 py-2 text-sm font-mono bg-white border border-[#0F1B3D]/15 focus:border-[#0F1B3D] outline-none" />
            <button type="button" onClick={applyColor}
              className="px-3 py-2 bg-[#0F1B3D] text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-[#1a2d5a]">
              Aplicar
            </button>
            {colors[colorEdit.cat] && (
              <button type="button" onClick={() => { onSetColor(colorEdit.cat, null); setColorEdit(null); }}
                className="px-3 py-2 bg-white border border-[#0F1B3D]/20 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0F1B3D]/70 hover:border-red-300 hover:text-red-600">
                Remover
              </button>
            )}
          </div>
        </div>
      )}

      {/* Input para nova categoria */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
          placeholder="Nova categoria…"
          className="flex-1 px-3 py-2 text-sm bg-[#F4F6FB] border border-[#0F1B3D]/15 focus:border-[#0F1B3D] focus:bg-white outline-none transition-colors"
        />
        <button type="button" onClick={handleAdd}
          disabled={!newCat.trim() || categories.includes(newCat.trim())}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#0F1B3D] text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-[#1a2d5a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <I name="Plus" size={12} /> Criar
        </button>
      </div>

      {delConfirm && (
        <p className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
          <I name="AlertTriangle" size={11} /> Clique no lixo novamente para confirmar exclusão
        </p>
      )}
    </div>
  );
}

window.ProductFormView = ProductFormView;
