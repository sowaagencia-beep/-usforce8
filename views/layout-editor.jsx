// Editor de Layout do Catálogo — USFORCE8
const {
  useState: useStateLE,
  useMemo:  useMemoLE,
  useRef:   useRefLE,
} = React;

function LayoutEditorView({
  entitySlug, entity, holdings, products, categories,
  catalogConfig, entityLogos,
  onSave, onBack,
}) {
  const { getSlugsUnder } = window.USFORCE_DATA;
  const { A4W, A4H, BLOCK_DEFS, DEFAULT_LAYOUT, ProductPage } = window.CatalogShared;

  // ── Layout state ──────────────────────────────────────────────────────────
  const initLayout = (catalogConfig?.layout && catalogConfig.layout.rightCol)
    ? catalogConfig.layout
    : DEFAULT_LAYOUT;

  const [blocks,       setBlocks]       = useStateLE(() => initLayout.rightCol.map(b => ({ ...b })));
  const [leftWidthPct, setLeftWidthPct] = useStateLE(initLayout.leftWidthPct || 47);
  const [rightBg,      setRightBg]      = useStateLE(initLayout.rightBg || 'accent');
  const [saved,        setSaved]        = useStateLE(false);

  // ── Drag state ────────────────────────────────────────────────────────────
  const [dragIdx,  setDragIdx]  = useStateLE(null); // index in blocks[] being dragged
  const [dropIdx,  setDropIdx]  = useStateLE(null); // drop target index

  // ── Sample product for preview ────────────────────────────────────────────
  const sampleProduct = useMemoLE(() => {
    const slugs = getSlugsUnder(entitySlug, holdings);
    const found = products.find(p => p.active && slugs.includes(p.companySlug));
    return found || {
      id:'preview', name:'Nome do Produto', category:'Categoria', code:'COD-001',
      origin:'Brasil',
      short:'Descrição curta do produto para visualização do layout.',
      long:'Descrição longa com mais detalhes sobre características, especificações e informações importantes do produto.',
      unitsPerBox:12, images:[], active:true, companySlug:entitySlug,
    };
  }, [products, entitySlug, holdings]);

  const logoUrl = entityLogos?.[entitySlug] || null;
  const accent  = entity?.accent || '#1A4A8C';
  const currentLayout = { rightCol: blocks, leftWidthPct, rightBg };

  // ── Block operations ──────────────────────────────────────────────────────
  const addBlock = (type) => {
    const id = `${type}-${Date.now()}`;
    setBlocks(b => [...b, { id, type }]);
  };

  const removeBlock = (idx) => {
    setBlocks(b => b.filter((_, i) => i !== idx));
  };

  const handleDragStart = (e, idx) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropIdx !== idx) setDropIdx(idx);
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIdx) { setDragIdx(null); setDropIdx(null); return; }
    setBlocks(b => {
      const next = [...b];
      const [item] = next.splice(dragIdx, 1);
      const insertAt = dragIdx < targetIdx ? targetIdx - 1 : targetIdx;
      next.splice(Math.max(0, insertAt), 0, item);
      return next;
    });
    setDragIdx(null);
    setDropIdx(null);
  };

  const handleDragEnd = () => { setDragIdx(null); setDropIdx(null); };

  const handleSave = () => {
    onSave(entitySlug, currentLayout);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const resetToDefault = () => {
    setBlocks(DEFAULT_LAYOUT.rightCol.map(b => ({ ...b })));
    setLeftWidthPct(DEFAULT_LAYOUT.leftWidthPct);
    setRightBg(DEFAULT_LAYOUT.rightBg);
  };

  const IcnL = ({ name, ...p }) => { const C = window.lucide[name]; return C ? <C {...p} /> : null; };

  // BG options
  const BG_OPTIONS = [
    { value:'accent', label:'Cor da marca',  style:{ background: accent } },
    { value:'dark',   label:'Azul escuro',   style:{ background:'#0F1B3D' } },
    { value:'light',  label:'Cinza claro',   style:{ background:'#F4F6FB', border:'1px solid #ccc' } },
    { value:'white',  label:'Branco',        style:{ background:'#ffffff', border:'1px solid #ccc' } },
  ];

  // Preview scale
  const SCALE = 0.52;
  const PW = Math.round(A4W * SCALE);
  const PH = Math.round(A4H * SCALE);

  return (
    <div style={{ height:'100vh', background:'#F4F6FB', display:'flex', flexDirection:'column', fontFamily:'Inter,sans-serif' }}>

      {/* Header */}
      <header style={{ height:'56px', background:'#0F1B3D', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', padding:'0 20px', gap:'16px', flexShrink:0 }}>
        <button onClick={onBack}
          style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.18em', color:'rgba(255,255,255,0.55)', background:'none', border:'none', cursor:'pointer' }}>
          <IcnL name="ArrowLeft" size={14} color="currentColor" /> Voltar
        </button>
        <div style={{ width:'1px', height:'22px', background:'rgba(255,255,255,0.1)' }} />
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'28px', height:'28px', background:accent, clipPath:'polygon(0 0,100% 0,100% 70%,75% 100%,0 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:900, color:'#fff', fontFamily:"'Barlow Condensed',sans-serif" }}>
            {(entity?.name||'').slice(0,2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'rgba(255,255,255,0.45)' }}>Editor de Layout</div>
            <div style={{ fontSize:'13px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.04em', color:'#fff', fontFamily:"'Barlow Condensed',sans-serif" }}>{entity?.name}</div>
          </div>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:'8px' }}>
          <button onClick={resetToDefault}
            style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.16em', color:'rgba(255,255,255,0.5)', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)', padding:'8px 14px', cursor:'pointer', clipPath:'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%)' }}>
            <IcnL name="RotateCcw" size={12} color="currentColor" /> Padrão
          </button>
          <button onClick={handleSave}
            style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.18em', color:'#fff', background: saved ? '#059669' : accent, border:'none', padding:'10px 20px', cursor:'pointer', clipPath:'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)', transition:'background 0.3s' }}>
            <IcnL name={saved ? 'Check' : 'Save'} size={14} color="#fff" />
            {saved ? 'Salvo!' : 'Salvar Layout'}
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex:1, display:'flex', overflow:'hidden', minHeight:0 }}>

        {/* ── Painel esquerdo: blocos ativos ──────────────────────────────── */}
        <div style={{ width:'260px', background:'#fff', borderRight:'1px solid rgba(15,27,61,0.1)', display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(15,27,61,0.08)', background:'#F4F6FB' }}>
            <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'rgba(15,27,61,0.55)' }}>
              Painel direito · {blocks.length} bloco{blocks.length !== 1 ? 's' : ''}
            </div>
            <div style={{ fontSize:'11px', color:'rgba(15,27,61,0.45)', marginTop:'3px' }}>Arraste para reordenar</div>
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'8px' }}>
            {blocks.length === 0 && (
              <div style={{ padding:'24px 16px', textAlign:'center', color:'rgba(15,27,61,0.35)', fontSize:'11px' }}>
                Nenhum bloco — adicione da paleta →
              </div>
            )}
            {blocks.map((block, i) => {
              const def = BLOCK_DEFS.find(d => d.type === block.type) || { label: block.type, icon:'Square' };
              const isDragging = dragIdx === i;
              const isTarget   = dropIdx === i && dragIdx !== i;
              return (
                <div key={block.id || i}
                  draggable
                  onDragStart={e => handleDragStart(e, i)}
                  onDragOver={e => handleDragOver(e, i)}
                  onDrop={e => handleDrop(e, i)}
                  onDragEnd={handleDragEnd}
                  style={{
                    display:'flex', alignItems:'center', gap:'8px',
                    padding:'8px 10px', marginBottom:'4px',
                    background: isDragging ? 'rgba(15,27,61,0.04)' : isTarget ? `${accent}15` : '#F8F9FC',
                    border: isTarget ? `1.5px solid ${accent}` : '1.5px solid transparent',
                    borderRadius:'2px', cursor:'grab', opacity: isDragging ? 0.4 : 1,
                    transition:'border-color 0.12s, background 0.12s',
                    userSelect:'none',
                  }}>
                  <IcnL name="GripVertical" size={14} color="rgba(15,27,61,0.3)" style={{ flexShrink:0 }} />
                  <div style={{
                    width:'22px', height:'22px', background: accent, flexShrink:0,
                    clipPath:'polygon(0 0,100% 0,100% 70%,80% 100%,0 100%)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <IcnL name={def.icon} size={10} color="#fff" />
                  </div>
                  <span style={{ flex:1, fontSize:'12px', fontWeight:600, color:'#0F1B3D' }}>{def.label}</span>
                  <button onClick={() => removeBlock(i)}
                    style={{ background:'none', border:'none', cursor:'pointer', padding:'2px', color:'rgba(15,27,61,0.35)', display:'flex', alignItems:'center' }}>
                    <IcnL name="X" size={13} color="currentColor" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Centro: preview A4 ──────────────────────────────────────────── */}
        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', alignItems:'center', padding:'28px 24px', background:'#1a2035', minWidth:'300px' }}>
          <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.22em', color:'rgba(255,255,255,0.25)', marginBottom:'18px' }}>
            Pré-visualização — A4 {Math.round(SCALE * 100)}%
          </div>

          <div style={{ boxShadow:'0 12px 48px rgba(0,0,0,0.7)', flexShrink:0 }}>
            <div style={{ width:`${PW}px`, height:`${PH}px`, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, transform:`scale(${SCALE})`, transformOrigin:'top left', width:`${A4W}px`, height:`${A4H}px` }}>
                <ProductPage
                  entity={entity}
                  product={sampleProduct}
                  pageNum={1}
                  totalPages={1}
                  layout={currentLayout}
                  logoUrl={logoUrl}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop:'14px', fontSize:'10px', color:'rgba(255,255,255,0.25)', fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase' }}>
            {A4W} × {A4H} px · 297 × 210 mm
          </div>
        </div>

        {/* ── Painel direito: paleta + configurações ──────────────────────── */}
        <div style={{ width:'264px', background:'#fff', borderLeft:'1px solid rgba(15,27,61,0.1)', display:'flex', flexDirection:'column', flexShrink:0, overflowY:'auto' }}>

          {/* Paleta de blocos */}
          <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(15,27,61,0.08)', background:'#F4F6FB' }}>
            <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'rgba(15,27,61,0.55)' }}>Paleta de Blocos</div>
            <div style={{ fontSize:'11px', color:'rgba(15,27,61,0.45)', marginTop:'3px' }}>Clique para adicionar</div>
          </div>
          <div style={{ padding:'10px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
            {BLOCK_DEFS.map(def => (
              <button key={def.type} onClick={() => addBlock(def.type)}
                style={{
                  display:'flex', alignItems:'center', gap:'7px', padding:'7px 9px',
                  background:'#F8F9FC', border:'1px solid rgba(15,27,61,0.1)',
                  cursor:'pointer', textAlign:'left',
                  transition:'background 0.12s, border-color 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${accent}12`; e.currentTarget.style.borderColor = accent; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F8F9FC'; e.currentTarget.style.borderColor = 'rgba(15,27,61,0.1)'; }}
              >
                <div style={{ width:'20px', height:'20px', background:accent, flexShrink:0, clipPath:'polygon(0 0,100% 0,100% 70%,80% 100%,0 100%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <IcnL name={def.icon} size={10} color="#fff" />
                </div>
                <span style={{ fontSize:'10px', fontWeight:700, color:'#0F1B3D', lineHeight:1.2 }}>{def.label}</span>
              </button>
            ))}
          </div>

          {/* Configurações */}
          <div style={{ padding:'14px 16px', borderTop:'1px solid rgba(15,27,61,0.08)', borderBottom:'1px solid rgba(15,27,61,0.08)', background:'#F4F6FB' }}>
            <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'rgba(15,27,61,0.55)' }}>Configurações</div>
          </div>

          <div style={{ padding:'16px' }}>

            {/* Largura da foto */}
            <div style={{ marginBottom:'20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ fontSize:'11px', fontWeight:700, color:'#0F1B3D' }}>Largura da foto</span>
                <span style={{ fontSize:'11px', fontWeight:700, color:accent }}>{leftWidthPct}%</span>
              </div>
              <input type="range" min="25" max="65" step="1" value={leftWidthPct}
                onChange={e => setLeftWidthPct(Number(e.target.value))}
                style={{ width:'100%', accentColor: accent }} />
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:'4px' }}>
                <span style={{ fontSize:'9px', color:'rgba(15,27,61,0.4)' }}>25% (menor)</span>
                <span style={{ fontSize:'9px', color:'rgba(15,27,61,0.4)' }}>65% (maior)</span>
              </div>
              <div style={{ marginTop:'6px', fontSize:'10px', color:'rgba(15,27,61,0.5)', lineHeight:1.4 }}>
                Painel de info: {100 - leftWidthPct}%
              </div>
            </div>

            {/* Cor do painel */}
            <div>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#0F1B3D', marginBottom:'10px' }}>Fundo do painel</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {BG_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setRightBg(opt.value)}
                    style={{
                      display:'flex', alignItems:'center', gap:'10px', padding:'8px 10px',
                      background: rightBg === opt.value ? `${accent}12` : 'transparent',
                      border: rightBg === opt.value ? `1.5px solid ${accent}` : '1.5px solid rgba(15,27,61,0.1)',
                      cursor:'pointer', textAlign:'left', transition:'all 0.12s',
                    }}>
                    <div style={{ width:'22px', height:'22px', flexShrink:0, borderRadius:'2px', ...opt.style }} />
                    <span style={{ fontSize:'11px', fontWeight:600, color:'#0F1B3D' }}>{opt.label}</span>
                    {rightBg === opt.value && (
                      <IcnL name="Check" size={12} color={accent} style={{ marginLeft:'auto' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
