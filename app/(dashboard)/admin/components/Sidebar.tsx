"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Reservas", href: "/admin/bookings" },
    { name: "Propiedades (Hostaway)", href: "/admin/properties" },
    { name: "Flota de Autos", href: "/admin/cars" },
    { name: "Yates y Charters", href: "/admin/yachts" },
    { name: "Configuración", href: "/admin/settings" },
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
        {menuItems.map((item) => {
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
          <Link href="/admin/login">
            <span style={{ color: '#dc3545' }}>Cerrar Sesión</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}