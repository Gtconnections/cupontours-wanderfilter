"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import WishlistButton from '@/components/wishlist/WishlistButton';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { getDict } from '@/app/i18n/dictionaries';
import { localeFromPath, withLocale } from '@/app/i18n/locale';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  
  const [activeSearchTab, setActiveSearchTab] = useState(null);
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 0
  });

  // Estado para el calendario
  const getFirstOfMonth = (monthsAhead) => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + monthsAhead, 1);
  };
  const [currentMonth, setCurrentMonth] = useState(() => getFirstOfMonth(0));
  const [nextMonth, setNextMonth] = useState(() => getFirstOfMonth(1));

  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  // i18n: idioma según la ruta (/es -> español)
  const locale = localeFromPath(pathname);
  const t = getDict(locale).nav;
  const sd = getDict(locale).search;
  const L = (href) => withLocale(href, locale);

  const lightPages = ['/about', '/contact', '/about-us', '/terms', '/privacy', '/services', '/login', '/recover-account'];
  const isLightPage =
        lightPages.includes(pathname) ||
        (pathname.startsWith('/properties/') && pathname !== '/properties') ||
        (pathname.startsWith('/cars/') && pathname !== '/cars') ||
        (pathname.startsWith('/yachts/') && pathname !== '/yachts') ||
        (pathname.startsWith('/services/transport/') && pathname !== '/services/transport') ||
        (pathname.startsWith('/services/real-estate/') && pathname !== '/services/real-estate') ||
        (pathname.startsWith('/services/experiences/') && pathname !== '/services/experiences') ||
        (pathname.startsWith('/services/general/') && pathname !== '/services/general') ||
        (pathname.startsWith('/services/wellness/') && pathname !== '/services/wellness') ||
        (pathname.startsWith('/services/health/') && pathname !== '/services/health') ||
        (pathname.startsWith('/services/events/') && pathname !== '/services/events');

  // Cargar ciudades disponibles al montar el componente
  useEffect(() => {
    const loadCities = async () => {
      try {
        setIsLoadingCities(true);
        const response = await fetch('/api/properties/cities');
        const data = await response.json();
        if (data.success) {
          setAvailableCities(data.data.cities || []);
        }
      } catch (error) {
        console.error('Error loading cities:', error);
      } finally {
        setIsLoadingCities(false);
      }
    };
    loadCities();
  }, []);

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
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Formateadores para mostrar en el buscador
  const formatWhere = () => searchData.location || sd.whereShort;
  // Formateadores para mostrar en el buscador - CORREGIDO
  const formatWhen = () => {
    if (searchData.checkIn && searchData.checkOut) {
      // ✅ Parsear fechas correctamente sin problemas de zona horaria
      const checkInParts = searchData.checkIn.split('-').map(Number);
      const checkOutParts = searchData.checkOut.split('-').map(Number);
      
      const checkInDate = new Date(checkInParts[0], checkInParts[1] - 1, checkInParts[2]);
      const checkOutDate = new Date(checkOutParts[0], checkOutParts[1] - 1, checkOutParts[2]);
      
      const options = { month: 'short', day: 'numeric' };
      return `${checkInDate.toLocaleDateString(sd.dateLocale, options)} - ${checkOutDate.toLocaleDateString(sd.dateLocale, options)}`;
    }
    return sd.whenShort;
  };
  const formatWho = () => {
    if (searchData.guests > 0) {
      return `${searchData.guests} ${searchData.guests > 1 ? sd.guestMany : sd.guestOne}`;
    }
    return sd.whoShort;
  };

  // Funciones del calendario
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateDisabled = (year, month, day) => {
    const today = new Date();
    const checkDate = new Date(year, month, day);
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return checkDate < todayDate;
  };

  const isDateSelected = (year, month, day) => {
    if (!searchData.checkIn) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === searchData.checkIn || dateStr === searchData.checkOut;
  };

  const isDateInRange = (year, month, day) => {
    if (!searchData.checkIn || !searchData.checkOut) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr > searchData.checkIn && dateStr < searchData.checkOut;
  };

  // Manejar cambio de fecha - CORREGIDO
  const handleDateClick = (year, month, day) => {
  // ✅ Crear fecha en UTC para evitar problemas de zona horaria
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  // ✅ Validar que la fecha no sea anterior a hoy
  const today = new Date();
  const selectedDate = new Date(year, month, day);
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  if (selectedDate < todayDate) {
    return; // No permitir fechas pasadas
  }
  
  if (!searchData.checkIn || (searchData.checkIn && searchData.checkOut)) {
    // ✅ Iniciar nueva selección
    setSearchData(prev => ({
      ...prev,
      checkIn: dateStr,
      checkOut: ''
    }));
  } else if (searchData.checkIn && !searchData.checkOut) {
    // ✅ Completar selección
    if (dateStr > searchData.checkIn) {
      setSearchData(prev => ({
        ...prev,
        checkOut: dateStr
      }));
      // Auto-avanzar a "Who" después de seleccionar
      setTimeout(() => setActiveSearchTab('who'), 300);
    } else if (dateStr < searchData.checkIn) {
      // ✅ Si selecciona una fecha anterior, reiniciar con la nueva fecha como checkIn
      setSearchData(prev => ({
        ...prev,
        checkIn: dateStr,
        checkOut: ''
      }));
    }
  }
};

  const renderCalendar = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const monthName = monthDate.toLocaleDateString(sd.dateLocale, { month: 'long', year: 'numeric' });
    
    const days = [];
    // Días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="cal-day empty"></div>);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDateDisabled(year, month, day);
      const selected = isDateSelected(year, month, day);
      const inRange = isDateInRange(year, month, day);
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`cal-day ${disabled ? 'disabled' : 'selectable'} ${selected ? 'selected' : ''} ${inRange ? 'in-range' : ''}`}
          onClick={() => !disabled && handleDateClick(year, month, day)}
        >
          {day}
        </div>
      );
    }
    
    return { monthName, days };
  };

  // Navegar meses
  const goToPreviousMonth = () => {
    const newCurrent = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const newNext = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    setCurrentMonth(newCurrent);
    setNextMonth(newNext);
  };

  const goToNextMonth = () => {
    const newCurrent = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const newNext = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 1);
    setCurrentMonth(newCurrent);
    setNextMonth(newNext);
  };

  // Manejar cambio de huéspedes
  const handleGuestChange = (operation) => {
    setSearchData(prev => ({
      ...prev,
      guests: operation === 'add' ? prev.guests + 1 : Math.max(0, prev.guests - 1)
    }));
  };

  // ✅ FUNCIÓN PARA APLICAR (SOLO CIERRA EL POPOVER, NO BUSCA)
  const handleApply = () => {
    setActiveSearchTab(null);
    // NO llamamos a performSearch() aquí
  };

  // ✅ FUNCIÓN DE BÚSQUEDA PRINCIPAL (SOLO SE EJECUTA CON EL BOTÓN SEARCH)
  const performSearch = () => {
    const params = new URLSearchParams();
    
    if (searchData.location) params.append('city', searchData.location);
    if (searchData.checkIn) params.append('checkIn', searchData.checkIn);
    if (searchData.checkOut) params.append('checkOut', searchData.checkOut);
    if (searchData.guests > 0) params.append('guests', searchData.guests.toString());
    
    const queryString = params.toString();
    const targetUrl = queryString ? `/properties?${queryString}` : '/properties';
    
    router.push(targetUrl);
    
    // Cerrar el buscador
    setActiveSearchTab(null);
    setIsSearchExpanded(false);
  };

  const headerClasses = `main-header ${isScrolled || activeSearchTab || isSearchExpanded || isLightPage ? 'header-scrolled' : ''}`;

  // Renderizar calendario
  const currentCalendar = renderCalendar(currentMonth);
  const nextCalendar = renderCalendar(nextMonth);

  return (
    <header className={headerClasses}>
      <div className="header-container">
        
        {/* LOGOTIPO */}
        <Link href={L('/')} className={`logo ${isSearchExpanded ? 'hide-on-mobile' : ''}`}>
          <span className="logo-full">
            <span className="brand-header-cupon">cupon</span>
            <span className="brand-header-tours">tours</span>
          </span>
          <span className="logo-short">
            <span className="brand-header-cupon">C</span>
            <span className="brand-header-tours">P</span>
          </span>
        </Link>
        
        {/* CENTRO: BUSCADOR INTERACTIVO */}
        <div className={`search-wrapper ${isSearchExpanded ? 'expanded' : ''}`} ref={searchRef}>
          
          {/* GATILLO MÓVIL */}
          {!isSearchExpanded && (
            <button className="mobile-search-trigger" onClick={() => setIsSearchExpanded(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>{searchData.location || sd.whereTo}</span>
            </button>
          )}

          {/* BARRA COMPLETA */}
          <div className={`interactive-search-bar ${activeSearchTab ? 'is-active' : ''} ${isSearchExpanded ? 'show-expanded' : ''}`}>
            
            <div className={`search-segment where-segment ${activeSearchTab === 'where' ? 'active' : ''}`} onClick={() => setActiveSearchTab('where')}>
              <div className="segment-content">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="search-icon-small">
                  <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span style={{color: searchData.location ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: searchData.location ? '500' : '400'}}>
                  {activeSearchTab === 'where' ? sd.where : formatWhere()}
                </span>
              </div>
            </div>

            <div className="search-divider"></div>

            <div className={`search-segment when-segment ${activeSearchTab === 'when' ? 'active' : ''}`} onClick={() => setActiveSearchTab('when')}>
              <div className="segment-content">
                <span style={{color: (searchData.checkIn && searchData.checkOut) ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: (searchData.checkIn && searchData.checkOut) ? '500' : '400'}}>
                  {activeSearchTab === 'when' ? sd.when : formatWhen()}
                </span>
              </div>
            </div>

            <div className="search-divider"></div>

            <div className={`search-segment who-segment ${activeSearchTab === 'who' ? 'active' : ''}`} onClick={() => setActiveSearchTab('who')}>
              <div className="segment-content">
                <span style={{color: searchData.guests > 0 ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: searchData.guests > 0 ? '500' : '400'}}>
                  {activeSearchTab === 'who' ? sd.who : formatWho()}
                </span>
              </div>
              <button className="search-btn" onClick={(e) => { 
                e.stopPropagation(); 
                performSearch();
              }}>
                {sd.search}
              </button>
            </div>
          </div>

          {/* POPOVER - WHERE (Ciudades) */}
          {activeSearchTab === 'where' && (
            <div className="search-popover popover-where">
              <div className="popover-section">
                <p className="popover-subtitle">{sd.availableDest}</p>
                {isLoadingCities ? (
                  <div className="loading-cities">{sd.loadingCities}</div>
                ) : (
                  availableCities.map((city) => (
                    <div 
                      key={city} 
                      className="location-item" 
                      onClick={() => {
                        setSearchData({...searchData, location: city});
                        setActiveSearchTab('when');
                      }}
                    >
                      <div className="icon-box">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                      <span>{city}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* POPOVER - WHEN (Calendario DINÁMICO) */}
          {activeSearchTab === 'when' && (
            <div className="search-popover popover-when">
              <div className="when-tabs">
                <button className="when-tab active">{sd.dates}</button>
              </div>
              <div className="calendar-container">
                <div className="calendar-month">
                  <div className="month-header">
                    <button aria-label={locale === 'es' ? 'Mes anterior' : 'Previous month'} className="cal-nav" onClick={goToPreviousMonth}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6"/>
                      </svg>
                    </button>
                    <strong>{currentCalendar.monthName}</strong>
                    <span></span>
                  </div>
                  <div className="cal-grid">
                    {sd.weekdays.map(d => <div key={d} className="cal-day-name">{d}</div>)}
                    {currentCalendar.days}
                  </div>
                </div>
                <div className="calendar-month">
                  <div className="month-header">
                    <span></span>
                    <strong>{nextCalendar.monthName}</strong>
                    <button aria-label={locale === 'es' ? 'Mes siguiente' : 'Next month'} className="cal-nav" onClick={goToNextMonth}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  </div>
                  <div className="cal-grid">
                    {sd.weekdays.map(d => <div key={d} className="cal-day-name">{d}</div>)}
                    {nextCalendar.days}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ POPOVER - WHO (CORREGIDO: Apply NO ejecuta búsqueda) */}
          {activeSearchTab === 'who' && (
            <div className="search-popover popover-who">
              <div className="counter-row">
                <span className="counter-label">{sd.guests}</span>
                <div className="counter-controls">
                  <button 
                    className="counter-btn" 
                    aria-label={locale === 'es' ? 'Quitar huésped' : 'Remove guest'} onClick={() => handleGuestChange('sub')} 
                    disabled={searchData.guests === 0}
                  >
                    −
                  </button>
                  <span className="count-value">{searchData.guests === 0 ? sd.any : searchData.guests}</span>
                  <button 
                    className="counter-btn" 
                    aria-label={locale === 'es' ? 'Agregar huésped' : 'Add guest'} onClick={() => handleGuestChange('add')}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="popover-actions">
                <button className="popover-clear" onClick={() => {
                  setSearchData(prev => ({...prev, guests: 0}));
                }}>{sd.clear}</button>
                <button className="popover-apply" onClick={handleApply}>
                  {sd.apply}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="header-right" ref={menuRef}>
          <ThemeToggle className="theme-toggle--header" />
          <WishlistButton className={isSearchExpanded ? 'hide-on-mobile' : ''} />
          <Link href={L('/jets')} className={`btn-host ${isSearchExpanded ? 'hide-on-mobile' : ''}`}>{t.jets}</Link>
          <button className={`menu-btn ${isMenuOpen ? 'active' : ''}`} aria-label={isMenuOpen ? (locale === 'es' ? 'Cerrar menú' : 'Close menu') : (locale === 'es' ? 'Abrir menú' : 'Open menu')} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 1H18M0 11H18" stroke="currentColor" strokeWidth="1.5"/></svg>
            )}
          </button>
          
          <nav className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
            <ul>
              <li><Link href={L('/')} onClick={() => setIsMenuOpen(false)}>{t.home}</Link></li>
              <li className="menu-divider"></li>
              {/* Verticales B2C (reservar) */}
              <li><Link href="https://luxury.cupontours.com" target="_blank">{t.villas}</Link></li>
              <li><Link href={L('/properties')} onClick={() => setIsMenuOpen(false)}>{t.properties}</Link></li>
              <li><Link href={L('/cars')} onClick={() => setIsMenuOpen(false)}>{t.cars}</Link></li>
              <li><Link href={L('/yachts')} onClick={() => setIsMenuOpen(false)}>{t.yachts}</Link></li>
              <li><Link href={L('/services')} onClick={() => setIsMenuOpen(false)}>{t.services}</Link></li>
              <li className="menu-divider"></li>
              {/* Puerta única B2B (dueños) */}
              <li><Link href={L('/invest-with-us')} onClick={() => setIsMenuOpen(false)}>{t.listProperty}</Link></li>
              <li className="menu-divider"></li>
              <li><Link href={L('/about-us')} onClick={() => setIsMenuOpen(false)}>{t.about}</Link></li>
              <li><Link href={L('/contact')} onClick={() => setIsMenuOpen(false)}>{t.contact}</Link></li>
              <li className="menu-divider mobile-only"></li>
              <li className="menu-theme-li">
                <div className="menu-theme-row">
                  <span>{locale === 'es' ? 'Tema' : 'Theme'}</span>
                  <ThemeToggle className="theme-toggle--menu" />
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}