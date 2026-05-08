// Componentes de marca USFORCE8

function UsforceLogo({ size = 28, light = false }) {
  // SVG viewBox is 1554×166 — set explicit width so browser renders it correctly
  const w = Math.round(size * (1554 / 166));
  return (
    <div className="flex items-center select-none" style={{ height: size, width: w }}>
      <img
        src="logo_usforce8.svg"
        alt="USFORCE8"
        width={w}
        height={size}
        style={{
          display: 'block',
          filter: light ? 'brightness(0) invert(1)' : 'none',
        }}
      />
    </div>
  );
}

function CompanyMark({ company, size = 'lg', light = false }) {
  const sizes = {
    sm: { box: 'h-8 w-8 text-sm', title: 'text-sm', tag: 'text-[9px]' },
    md: { box: 'h-12 w-12 text-base', title: 'text-base', tag: 'text-[10px]' },
    lg: { box: 'h-20 w-20 text-2xl', title: 'text-3xl', tag: 'text-xs' },
    xl: { box: 'h-24 w-24 text-3xl', title: 'text-5xl', tag: 'text-sm' },
  }[size];
  const initials = company.name.replace(/[^A-Z0-9]/g, '').slice(0, 2) || company.name.slice(0,2).toUpperCase();
  const txt = light ? '#FFFFFF' : '#0F1B3D';
  const sub = light ? 'rgba(255,255,255,0.7)' : 'rgba(15,27,61,0.6)';
  return (
    <div className="flex items-center gap-3">
      <div
        className={`${sizes.box} flex items-center justify-center font-black tracking-tight`}
        style={{
          background: light ? 'rgba(255,255,255,0.12)' : '#0F1B3D',
          color: light ? '#FFFFFF' : '#E8EEF7',
          clipPath: 'polygon(0 0, 100% 0, 100% 70%, 85% 100%, 0 100%)',
          fontFamily: "'Barlow Condensed', sans-serif",
        }}
      >{initials}</div>
      <div className="flex flex-col leading-tight">
        <span className={`${sizes.title} font-black tracking-tight uppercase`} style={{ color: txt, fontFamily: "'Barlow Condensed', sans-serif" }}>{company.name}</span>
        <span className={`${sizes.tag} uppercase tracking-[0.2em] font-semibold`} style={{ color: sub }}>{company.tagline}</span>
      </div>
    </div>
  );
}

function ChamferCard({ children, className = '', style = {}, chamfer = 18, ...rest }) {
  return (
    <div
      className={className}
      style={{
        clipPath: `polygon(0 0, calc(100% - ${chamfer}px) 0, 100% ${chamfer}px, 100% 100%, 0 100%)`,
        ...style,
      }}
      {...rest}
    >{children}</div>
  );
}

function PrimaryBtn({ children, onClick, type = 'button', className = '', icon, disabled }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white bg-[#0F1B3D] hover:bg-[#1A2A5C] active:bg-[#091228] disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}>
      {icon}{children}
    </button>
  );
}

function GhostBtn({ children, onClick, className = '', icon }) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F1B3D] bg-white border border-[#0F1B3D]/20 hover:border-[#0F1B3D] hover:bg-[#0F1B3D]/5 transition-colors ${className}`}
      style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}>
      {icon}{children}
    </button>
  );
}

function CompanyBadge({ company, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white ${className}`} style={{ background: '#0F1B3D' }}>
      {company.name}
    </span>
  );
}

function CategoryTag({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0F1B3D] bg-white/95 ${className}`}>
      {children}
    </span>
  );
}

function ProductImage({ product, className = '', heightClass = 'h-48' }) {
  const img = product.images?.[0];
  return (
    <div className={`relative overflow-hidden bg-white ${heightClass} ${className}`}>
      <img src={img} alt={product.name} className="w-full h-full object-contain" />
    </div>
  );
}

// Modal genérico
function Modal({ open, onClose, title, subtitle, icon, children, footer, width = 'max-w-lg' }) {
  if (!open) return null;
  const I = window.lucide;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#0F1B3D]/60 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className={`relative w-full ${width} bg-white shadow-2xl`}
           style={{ clipPath: 'polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%)' }}>
        <div className="px-6 pt-5 pb-3 border-b border-[#0F1B3D]/10 flex items-start gap-3">
          {icon && <span className="h-9 w-9 bg-[#F4F6FB] flex items-center justify-center text-[#0F1B3D] mt-0.5">{React.createElement(I[icon], { size: 16 })}</span>}
          <div className="flex-1">
            <h3 className="text-base font-black uppercase tracking-tight text-[#0F1B3D]" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.02em' }}>{title}</h3>
            {subtitle && <p className="text-xs text-[#0F1B3D]/60 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center text-[#0F1B3D]/60 hover:bg-[#F4F6FB]">
            {React.createElement(I.X, { size: 14 })}
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-[#0F1B3D]/10 flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

Object.assign(window, { UsforceLogo, CompanyMark, ChamferCard, PrimaryBtn, GhostBtn, CompanyBadge, CategoryTag, ProductImage, Modal });
