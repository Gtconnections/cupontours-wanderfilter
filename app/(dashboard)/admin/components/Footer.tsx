export function Footer() {
  return (
    <footer className="wander-admin-footer">
      <span className="wander-footer-copy">
        &copy; {new Date().getFullYear()} Cupontours Ultimate Ecosystem. All rights reserved.
      </span>
      <span className="wander-footer-copy" style={{ letterSpacing: '1px', fontSize: '10px', fontWeight: 600 }}>
        WANDER FILTER V2
      </span>
    </footer>
  );
}