"use client";

export function Navbar() {
  return (
    <nav className="wander-navbar">
      <div className="wander-nav-left">
        <h1>Wander Control Panel</h1>
      </div>
      
      <div className="wander-nav-right">
        <div className="wander-user-profile">
          <div className="wander-user-info" style={{ textAlign: 'right' }}>
            <span>Alexander Wander</span>
            <small>Administrator</small>
          </div>
          <div className="wander-avatar" />
        </div>
      </div>
    </nav>
  );
}