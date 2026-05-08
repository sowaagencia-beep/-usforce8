// Detalhe público de produto — USFORCE8

const { useState: useStateDet } = React;

function Id({ name, ...p }) { const C = window.lucide[name]; return C ? <C {...p} /> : null; }

function PublicProductDetailView({ product, products, holdings, onBack, onSelectProduct, onBackToAdmin, fromAdmin }) {
  const { buildEntityMap } = window.USFORCE_DATA;

  // Entity map covers both companies AND brands
  const entityMap = buildEntityMap(holdings);
  const entity = entityMap[product.companySlug];

  const [activeImg, setActiveImg] = useStateDet(0);
  const [activeTab, setActiveTab] = useStateDet('descricao');

  // Related: products from the same direct owner entity
  const related = products.filter(p => p.companySlug === product.companySlug && p.id !== product.id && p.active).slice(0, 4);

  if (!entity) return null;

  const parentLabel = entity.type === 'brand' && entity.parentName
    ? `${entity.parentName} · ${entity.holdingName}`
    : entity.holdingName;

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col">
      <header className="h-12 bg-white border-b border-[#0F1B3D]/10 flex items-center justify-center px-6 relative">
        <UsforceLogo size={22} />
        {fromAdmin && (
          <button onClick={onBackToAdmin}
            className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0F1B3D]/70 hover:text-[#0F1B3D] bg-[#F4F6FB] border border-[#0F1B3D]/15 px-3 py-1.5">
            <Id name="ArrowLeft" size={12} /> Voltar ao Painel
          </button>
        )}
      </header>

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-8 py-8">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0F1B3D]/50 mb-6">
          <button onClick={onBack} className="hover:text-[#0F1B3D]">{entity.name}</button>
          <span>›</span><span>Catálogo</span>
          <span>›</span><span>{product.category}</span>
          <span>›</span><span className="text-[#0F1B3D]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[110px_1fr_420px] gap-6">
          {/* Thumbnails */}
          <div className="flex lg:flex-col gap-2 order-2 lg:order-1">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`h-20 w-20 flex-shrink-0 border overflow-hidden transition-colors ${activeImg === i ? 'border-[#0F1B3D]' : 'border-[#0F1B3D]/15 hover:border-[#0F1B3D]/40'}`}>
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>

          {/* Main image */}
          <div className="relative bg-white order-1 lg:order-2 aspect-[4/3] overflow-hidden border border-[#0F1B3D]/10">
            <img src={product.images[activeImg]} className="w-full h-full object-contain" alt="" />
            {['top-2 left-2 border-t border-l', 'top-2 right-2 border-t border-r', 'bottom-2 left-2 border-b border-l', 'bottom-2 right-2 border-b border-r'].map((cls, i) => (
              <span key={i} className={`absolute ${cls} h-4 w-4 border-white/40`} />
            ))}
          </div>

          {/* Info sidebar */}
          <aside className="order-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] bg-[#0F1B3D] text-white">{product.category}</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0F1B3D]/50">CÓD: {product.code}</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-[#0F1B3D] tracking-tight leading-[0.95]"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '0.005em' }}>
              {product.name}
            </h1>

            {/* Brand / company attribution */}
            <div className="mt-3 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[#0F1B3D]/50">
              <Id name="Building2" size={11} />
              <span>{entity.name}</span>
              {entity.type === 'brand' && entity.parentName && <><span>·</span><span>{entity.parentName}</span></>}
            </div>

            <p className="mt-3 text-sm text-[#0F1B3D]/70 leading-relaxed">{product.long}</p>

            <div className="mt-6 border border-[#0F1B3D]/15 bg-white">
              <div className="flex items-center justify-between px-3 py-2 bg-[#F4F6FB] border-b border-[#0F1B3D]/10">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1B3D]">Informações do Produto</span>
                <Id name="Info" size={12} className="text-[#0F1B3D]/40" />
              </div>
              <div>
                {[
                  ['Código', product.code],
                  ['Unidades por Caixa', product.unitsPerBox === 0 ? 'Variável (por peso)' : product.unitsPerBox],
                  ['País de Origem', product.origin],
                ].map(([k, v], i) => (
                  <div key={i} className={`flex items-center justify-between px-3 py-2 text-xs ${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F6FB]/60'}`}>
                    <span className="uppercase tracking-[0.16em] text-[10px] font-bold text-[#0F1B3D]/60">{k}</span>
                    <span className="text-[#0F1B3D] font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#0F1B3D]/50">
              <span className="flex items-center gap-1.5"><Id name="ShieldCheck" size={11} /> Verificado</span>
              <span className="flex items-center gap-1.5"><Id name="Truck" size={11} /> Entrega nacional</span>
            </div>
          </aside>
        </div>

        {/* Tabs */}
        <div className="mt-12 border-b border-[#0F1B3D]/15">
          <nav className="flex items-center gap-1">
            {[
              { id: 'descricao', label: 'Descrição' },
              { id: 'specs',     label: 'Especificações' },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] border-b-2 transition-colors ${activeTab === t.id ? 'border-[#0F1B3D] text-[#0F1B3D]' : 'border-transparent text-[#0F1B3D]/50 hover:text-[#0F1B3D]'}`}>
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="py-6 text-sm text-[#0F1B3D]/75 leading-relaxed max-w-3xl">
          {activeTab === 'descricao' && (
            <div className="space-y-3">
              <p>{product.long}</p>
              <p>Produto comercializado pela {entity.name}, parte do conglomerado {entity.holdingName}.</p>
            </div>
          )}
          {activeTab === 'specs' && (
            <table className="w-full text-xs">
              <tbody>
                {[
                  ['Código', product.code],
                  ['Unidades por Caixa', product.unitsPerBox === 0 ? 'Variável (por peso)' : product.unitsPerBox],
                  ['País de Origem', product.origin],
                  ['Categoria', product.category],
                  ['Empresa / Marca', entity.name],
                  ...(entity.type === 'brand' && entity.parentName ? [['Empresa Pai', entity.parentName]] : []),
                ].map(([k, v], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F4F6FB]/60'}>
                    <td className="px-3 py-2 uppercase tracking-[0.16em] text-[10px] font-bold text-[#0F1B3D]/60 w-1/3">{k}</td>
                    <td className="px-3 py-2 text-[#0F1B3D] font-semibold">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-[#0F1B3D] uppercase tracking-tight"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Produtos Relacionados</h2>
              <button onClick={onBack}
                className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0F1B3D]/60 hover:text-[#0F1B3D] inline-flex items-center gap-1.5">
                Ver Catálogo Completo <Id name="ArrowRight" size={11} />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map(p => (
                <button key={p.id} onClick={() => onSelectProduct(p)}
                  className="text-left bg-white border border-[#0F1B3D]/10 hover:border-[#0F1B3D]/40 transition-colors">
                  <div className="relative">
                    <ProductImage product={p} heightClass="h-36" />
                    <div className="absolute top-2 left-2"><CategoryTag>{p.category}</CategoryTag></div>
                  </div>
                  <div className="px-3 py-3">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-[#0F1B3D]/50">CÓD: {p.code}</div>
                    <div className="text-sm font-bold text-[#0F1B3D] mt-1 line-clamp-1">{p.name}</div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-[#0F1B3D]/60">
                      <span>{p.unitsPerBox} un/cx</span>
                      <span className="font-semibold text-[#0F1B3D]">{p.origin}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="bg-[#0F1B3D] text-white mt-10">
        <div className="max-w-[1280px] mx-auto px-8 py-8 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/50 flex-wrap gap-3">
          <CompanyMark company={entity} size="sm" light />
          <span>© 2026 {parentLabel} · Powered by USFORCE8</span>
        </div>
      </footer>
    </div>
  );
}

window.PublicProductDetailView = PublicProductDetailView;
