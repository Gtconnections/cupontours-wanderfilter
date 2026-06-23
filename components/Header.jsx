"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false); // Estado elástico para buscador móvil
  
  const [activeSearchTab, setActiveSearchTab] = useState(null);
  const [searchData, setSearchData] = useState({
    location: '',
    dateStr: '',
    guests: 0,
    pets: 0
  });

  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const pathname = usePathname(); 
  
  const lightPages = ['/about', '/contact', '/about-us', '/terms', '/privacy', '/services', '/login', '/recover-account'];
  const isLightPage = 
        lightPages.includes(pathname) || 
        (pathname.startsWith('/properties/') && pathname !== '/properties') ||
        (pathname.startsWith('/cars/') && pathname !== '/cars') ||
        (pathname.startsWith('/yachts/') && pathname !== '/yachts');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setActiveSearchTab(null);
        setIsSearchExpanded(false); // Colapsa el buscador al hacer clic fuera
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatWhere = () => searchData.location || "Where";
  const formatWhen = () => searchData.dateStr || "When";
  const formatWho = () => {
    let parts = [];
    if (searchData.guests > 0) parts.push(`${searchData.guests} guest${searchData.guests > 1 ? 's' : ''}`);
    if (searchData.pets > 0) parts.push(`${searchData.pets} pet${searchData.pets > 1 ? 's' : ''}`);
    return parts.length > 0 ? parts.join(', ') : "Who";
  };

  const handleGuestChange = (type, operation) => {
    setSearchData(prev => ({
      ...prev,
      [type]: operation === 'add' ? prev[type] + 1 : Math.max(0, prev[type] - 1)
    }));
  };

  const headerClasses = `main-header ${isScrolled || activeSearchTab || isSearchExpanded || isLightPage ? 'header-scrolled' : ''}`;

  return (
    <header className={headerClasses}>
      <div className="header-container">
        
        {/* ==========================================================================
           LOGOTIPO RE-ESTILIZADO (IGUAL AL DEL FOOTER CON IDENTIDAD BICOLOR)
           ========================================================================== */}
        <Link href="/" className={`logo ${isSearchExpanded ? 'hide-on-mobile' : ''}`}>
          <span className="brand-header-cupon">cupon</span>
          <span className="brand-header-tours">tours</span>
        </Link>
        
        {/* CENTRO: BUSCADOR INTERACTIVO RESPONSIVO */}
        <div className={`search-wrapper ${isSearchExpanded ? 'expanded' : ''}`} ref={searchRef}>
          
          {/* GATILLO MÓVIL: Píldora de búsqueda compacta */}
          {!isSearchExpanded && (
            <button className="mobile-search-trigger" onClick={() => setIsSearchExpanded(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>{searchData.location || "Where to?"}</span>
            </button>
          )}

          {/* BARRA COMPLETA (Se controla con la clase expanded en móvil) */}
          <div className={`interactive-search-bar ${activeSearchTab ? 'is-active' : ''} ${isSearchExpanded ? 'show-expanded' : ''}`}>
            
            <div className={`search-segment where-segment ${activeSearchTab === 'where' ? 'active' : ''}`} onClick={() => setActiveSearchTab('where')}>
              <div className="segment-content">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="search-icon-small">
                  <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span style={{color: searchData.location ? '#111' : '#717171', fontWeight: searchData.location ? '500' : '400'}}>
                  {activeSearchTab === 'where' ? 'Where?' : formatWhere()}
                </span>
              </div>
            </div>

            <div className="search-divider"></div>

            <div className={`search-segment when-segment ${activeSearchTab === 'when' ? 'active' : ''}`} onClick={() => setActiveSearchTab('when')}>
              <div className="segment-content">
                <span style={{color: searchData.dateStr ? '#111' : '#717171', fontWeight: searchData.dateStr ? '500' : '400'}}>
                  {activeSearchTab === 'when' ? 'When?' : formatWhen()}
                </span>
              </div>
            </div>

            <div className="search-divider"></div>

            <div className={`search-segment who-segment ${activeSearchTab === 'who' ? 'active' : ''}`} onClick={() => setActiveSearchTab('who')}>
              <div className="segment-content">
                <span style={{color: (searchData.guests || searchData.pets) ? '#111' : '#717171', fontWeight: (searchData.guests || searchData.pets) ? '500' : '400'}}>
                  {activeSearchTab === 'who' ? 'Who?' : formatWho()}
                </span>
              </div>
              <button className="search-btn" onClick={(e) => { e.stopPropagation(); setActiveSearchTab(null); setIsSearchExpanded(false); }}>
                Search
              </button>
            </div>
          </div>

          {/* POPOVERS */}
          {activeSearchTab === 'where' && (
            <div className="search-popover popover-where">
              <input type="text" className="where-input" placeholder="Search locations..." value={searchData.location} onChange={(e) => setSearchData({...searchData, location: e.target.value})} />
              <div className="popover-section">
                <p className="popover-subtitle">Recent searches</p>
                <div className="location-item" onClick={() => {setSearchData({...searchData, location: 'United States'}); setActiveSearchTab('when');}}>
                  <div className="icon-box"><i className="fas fa-map-marker-alt"></i></div>
                  <span>United States</span>
                </div>
              </div>
              <div className="popover-section">
                <p className="popover-subtitle">Suggested regions</p>
                <div className="location-item" onClick={() => {setSearchData({...searchData, location: 'California'}); setActiveSearchTab('when');}}>
                  <img src="https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=100&q=80" alt="California" className="region-img" />
                  <span>California</span>
                </div>
                <div className="location-item" onClick={() => {setSearchData({...searchData, location: 'Florida'}); setActiveSearchTab('when');}}>
                  <img src="https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?auto=format&fit=crop&w=100&q=80" alt="Florida" className="region-img" />
                  <span>Florida</span>
                </div>
              </div>
            </div>
          )}

          {activeSearchTab === 'when' && (
            <div className="search-popover popover-when">
              <div className="when-tabs"><button className="when-tab active">Dates</button><button className="when-tab">Flexible</button></div>
              <div className="calendar-container">
                <div className="calendar-month">
                  <div className="month-header"><button className="cal-nav"><i className="fas fa-chevron-left"></i></button><strong>May 2026</strong><span></span></div>
                  <div className="cal-grid">
                    {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="cal-day-name">{d}</div>)}
                    {Array.from({length: 5}).map((_, i) => <div key={`empty-${i}`} className="cal-day empty"></div>)}
                    {Array.from({length: 31}).map((_, i) => <div key={`may-${i}`} className="cal-day disabled">{i + 1}</div>)}
                  </div>
                </div>
                <div className="calendar-month">
                  <div className="month-header"><span></span><strong>June 2026</strong><button className="cal-nav"><i className="fas fa-chevron-right"></i></button></div>
                  <div className="cal-grid">
                    {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="cal-day-name">{d}</div>)}
                    <div className="cal-day empty"></div>
                    <div className="cal-day selectable" onClick={() => setSearchData({...searchData, dateStr: 'Jun 1 - 3'})}>1</div>
                    <div className="cal-day selectable">2</div>
                    <div className="cal-day selectable" onClick={() => {setSearchData({...searchData, dateStr: 'Jun 1 - 3'}); setActiveSearchTab('who');}}>3</div>
                    {Array.from({length: 27}).map((_, i) => <div key={`jun-${i}`} className="cal-day">{i + 4}</div>)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSearchTab === 'who' && (
            <div className="search-popover popover-who">
              <div className="counter-row">
                <span className="counter-label">Guests</span>
                <div className="counter-controls">
                  <button onClick={() => handleGuestChange('guests', 'sub')} disabled={searchData.guests === 0}>−</button>
                  <span className="count-value">{searchData.guests === 0 ? 'Any' : searchData.guests}</span>
                  <button onClick={() => handleGuestChange('guests', 'add')}>+</button>
                </div>
              </div>
              <div className="popover-divider"></div>
              <div className="counter-row">
                <span className="counter-label">Pets</span>
                <div className="counter-controls">
                  <button onClick={() => handleGuestChange('pets', 'sub')} disabled={searchData.pets === 0}>−</button>
                  <span className="count-value">{searchData.pets === 0 ? 'Any' : searchData.pets}</span>
                  <button onClick={() => handleGuestChange('pets', 'add')}>+</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="header-right" ref={menuRef}>
          <Link href="/jets" className={`btn-host ${isSearchExpanded ? 'hide-on-mobile' : ''}`}>Luxury Jets</Link>
          <button className={`menu-btn ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 1H18M0 11H18" stroke="currentColor" strokeWidth="1.5"/></svg>
            )}
          </button>
          
          <nav className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
            <ul>
              <li><Link href="/home" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
              <li className="menu-divider"></li>
              <li><Link href="/about-us" onClick={() => setIsMenuOpen(false)}>About</Link></li>
              <li><Link href="/services" onClick={() => setIsMenuOpen(false)}>Services</Link></li>
              <li><Link href="/properties" onClick={() => setIsMenuOpen(false)}>Properties</Link></li>
              <li><Link href="/cars" onClick={() => setIsMenuOpen(false)}>Cars</Link></li>
              <li><Link href="/yachts" onClick={() => setIsMenuOpen(false)}>Yachts</Link></li>
              <li><Link href="/invest-with-us" onClick={() => setIsMenuOpen(false)}>Invest</Link></li>
              <li><Link href="/work-with-us" onClick={() => setIsMenuOpen(false)}>Team</Link></li>
              <li className="menu-divider"></li>
              <li><Link href="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}