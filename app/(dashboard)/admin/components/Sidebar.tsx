"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from '@/app/lib/utils/useAuth';
import { useState, useEffect } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  // 🔥 ESTADO PARA SUBMENÚS DESPLEGADOS
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    students: false,
    properties: false,
    cars: false,
    yachts: false,
  });

  // Menús principales con sus subitems
  const menuGroups = [
    {
      id: "students",
      label: "Students",
      subitems: [
        { name: "BNB Calculator", href: "/admin/students/bnb-calculator" },
        { name: "Furniture Standard", href: "/admin/students/furnish" },
        { name: "Cleaning Standard", href: "/admin/students/cleaning" },
      ]
    },
    {
      id: "properties",
      label: "Properties Business",
      subitems: [
        { name: "All Properties", href: "/admin/properties/list" },
        { name: "Profit and Loss", href: "/admin/properties/profit-and-loss" },
        { name: "Create an Invoice", href: "/admin/properties/invoices/create" },
        { name: "Create a Reservation", href: "/admin/properties/reservations/create" },
        { name: "Agreements", href: "/admin/properties/agreements" },
        { name: "Create masses", href: "/admin/properties/create-masses" },
      ]
    },
    {
      id: "cars",
      label: "Cars Business",
      subitems: [
        { name: "All the Cars", href: "/admin/cars/list" },
        { name: "Profit and Loss", href: "/admin/cars/profit-and-loss" },
        { name: "Create an Invoice", href: "/admin/cars/invoices/create" },
        { name: "Create a Reservation", href: "/admin/cars/reservations/create" },
        { name: "Create masses", href: "/admin/cars/create-masses" },
      ]
    },
    // 🔥 NUEVO: YACHTS BUSINESS
    {
      id: "yachts",
      label: "Yachts Business",
      subitems: [
        { name: "All the Yachts", href: "/admin/yachts/list" },
        { name: "Create an Invoice", href: "/admin/yachts/invoices/create" },
        { name: "Create a Reservation", href: "/admin/yachts/reservations/create" },
      ]
    }
  ];

  // 🔥 ABRIR EL SUBMENÚ SI EL PATH ACTUAL ESTÁ DENTRO DE ESE GRUPO
  useEffect(() => {
    const newOpenMenus: Record<string, boolean> = { ...openMenus };
    menuGroups.forEach(group => {
      const isActive = group.subitems.some(item => pathname === item.href);
      if (isActive) {
        newOpenMenus[group.id] = true;
      }
    });
    setOpenMenus(newOpenMenus);
  }, [pathname]);

  // 🔥 TOGGLE DEL SUBMENÚ
  const toggleMenu = (id: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 🔥 VERIFICAR SI UN SUBITEM ESTÁ ACTIVO
  const isSubItemActive = (href: string) => pathname === href;

  // 🔥 VERIFICAR SI UN GRUPO ESTÁ ACTIVO (si algún subitem está activo)
  const isGroupActive = (group: typeof menuGroups[0]) => {
    return group.subitems.some(item => pathname === item.href);
  };

  const mainMenuItems = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Users management", href: "/admin/users-list" },
    { name: "Processes", href: "/admin/processes" },
    { name: "Emergency contacts", href: "/admin/emergency-contacts" },
    { name: "My profile", href: "/admin/profile" },
  ];

  const bottomMenuItems = [
    { name: "Claims", href: "/admin/claims" },
    { name: "Cupon Tours Chat", href: "/admin/chat" },
  ];

  return (
    <aside className="wander-sidebar">
      <div className="wander-sidebar-brand">
        <img 
          src="https://res.cloudinary.com/gt-connections/image/upload/v1701818354/cupon-tours/STARTUP/logo-cupontours_s3akql.png" 
          alt="Cupontours Wander" 
          className="wander-admin-logo"
        />
      </div>
      
      <ul className="wander-sidebar-menu">
        {/* Menú principal */}
        {mainMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href} className={`wander-menu-item ${isActive ? "active" : ""}`}>
              <Link href={item.href}>
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}

        {/* 🔥 LÍNEA DIVISORIA CON TÍTULO */}
        <li className="wander-menu-divider">
          <span className="wander-divider-label">LISTINGS MANAGEMENT</span>
        </li>

        {/* 🔥 GRUPOS CON SUBMENÚS - SIN LINK EN EL PADRE */}
        {menuGroups.map((group) => {
          const isOpen = openMenus[group.id] || false;
          const isActive = isGroupActive(group);

          return (
            <li key={group.id} className="wander-menu-group">
              {/* 🔥 Item principal del grupo - SIN LINK, solo para toggle */}
              <div 
                className={`wander-menu-item wander-menu-toggle ${isActive ? "active" : ""}`}
                onClick={() => toggleMenu(group.id)}
              >
                <span className="wander-menu-label">{group.label}</span>
                <button 
                  className={`wander-menu-arrow ${isOpen ? "open" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMenu(group.id);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
              </div>

              {/* Subitems */}
              {isOpen && (
                <ul className="wander-submenu">
                  {group.subitems.map((subitem) => {
                    const isSubActive = isSubItemActive(subitem.href);
                    return (
                      <li key={subitem.href} className={`wander-submenu-item ${isSubActive ? "active" : ""}`}>
                        <Link href={subitem.href}>
                          <span>{subitem.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}

        {/* 🔥 LÍNEA DIVISORIA SIN TÍTULO */}
        <li className="wander-menu-divider"></li>

        {/* Bottom items */}
        {bottomMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href} className={`wander-menu-item ${isActive ? "active" : ""}`}>
              <Link href={item.href}>
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="wander-sidebar-footer">
        <div className="wander-menu-item">
          <a href="#" onClick={logout}>
            <span style={{ color: '#dc3545' }}>Cerrar Sesión</span>
          </a>
        </div>
      </div>
    </aside>
  );
}