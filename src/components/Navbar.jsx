import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { CartCtx } from '../store/CartContext';
import { FiShoppingCart, FiSearch, FiX, FiMenu, FiUser, FiLogOut, FiPackage, FiSettings } from 'react-icons/fi';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'About', href: '/About' },
  { name: 'Contact', href: '/Contact' },
];

export default function Navbar() {
  const { isLoggedIn, username, userRole, logout } = useContext(AuthContext);
  const { cartItems, Cost } = useContext(CartCtx);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef();
  const userMenuRef = useRef();

  const isActive = (path) => location.pathname === path;

  const cartCount = Array.isArray(cartItems)
    ? cartItems.reduce((acc, item) => acc + (parseInt(item.Quantity, 10) || 1), 0)
    : 0;

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMenuOpen(false);
  };

  // Close search on outside click
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [searchOpen]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <>
      <nav className="nb-root">
        <div className="nb-inner">

          {/* ── Logo ── */}
          <Link to="/" className="nb-logo">SHOP.CO</Link>

          {/* ── Desktop nav links ── */}
          <div className="nb-links">
            {NAV_LINKS.map(link => (
              <Link
                key={link.name}
                to={link.href}
                className={`nb-link ${isActive(link.href) ? 'nb-link--active' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* ── Right actions ── */}
          <div className="nb-actions">

            {/* Search (desktop) */}
            <div className="nb-search-wrap" ref={searchRef}>
              {searchOpen ? (
                <form onSubmit={handleSearch} className="nb-search-form">
                  <FiSearch size={15} color="#9CA3AF" className="nb-search-ico" />
                  <input
                    autoFocus
                    className="nb-search-input"
                    placeholder="Search…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <button type="button" className="nb-icon-btn" onClick={() => setSearchOpen(false)}>
                    <FiX size={16} />
                  </button>
                </form>
              ) : (
                <button className="nb-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
                  <FiSearch size={18} />
                </button>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className="nb-cart-btn" aria-label="Cart">
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="nb-cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </Link>

            {/* User / Auth */}
            {isLoggedIn ? (
              <div className="nb-user-wrap" ref={userMenuRef}>
                <button
                  className="nb-user-btn"
                  onClick={() => setUserMenuOpen(v => !v)}
                  aria-label="User menu"
                >
                  <div className="nb-avatar">
                    {(username || 'U')[0].toUpperCase()}
                  </div>
                  <span className="nb-username">{username}</span>
                  {userRole === 'admin' && <span className="nb-admin-tag">Admin</span>}
                </button>

                {userMenuOpen && (
                  <div className="nb-dropdown">
                    <div className="nb-dropdown-header">
                      <p className="nb-dropdown-name">{username}</p>
                      {userRole === 'admin' && <span className="nb-admin-tag">Admin</span>}
                    </div>
                    <div className="nb-dropdown-body">
                      <Link to="/profile" className="nb-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        <FiUser size={14} /> Profile
                      </Link>
                      {userRole !== 'admin' && (
                        <Link to="/orders" className="nb-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                          <FiPackage size={14} /> My Orders
                        </Link>
                      )}
                      {userRole === 'admin' && (
                        <>
                          <div className="nb-dropdown-divider" />
                          <Link to="/AdminProducts" className="nb-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                            <FiSettings size={14} /> Manage Products
                          </Link>
                          <Link to="/AdminOrders" className="nb-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                            <FiPackage size={14} /> Manage Orders
                          </Link>
                        </>
                      )}
                      <div className="nb-dropdown-divider" />
                      <button className="nb-dropdown-item nb-dropdown-logout" onClick={handleLogout}>
                        <FiLogOut size={14} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="nb-auth">
                <Link to="/login" className="nb-login-btn">Login</Link>
                <Link to="/signup" className="nb-signup-btn">Sign Up</Link>
              </div>
            )}

            {/* Hamburger */}
            <button
              className="nb-hamburger"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        {menuOpen && (
          <div className="nb-mobile-drawer">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="nb-mobile-search">
              <FiSearch size={15} color="#9CA3AF" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="nb-mobile-search-input"
                placeholder="Search products…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Nav links */}
            <div className="nb-mobile-links">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`nb-mobile-link ${isActive(link.href) ? 'nb-mobile-link--active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="nb-mobile-divider" />

            {/* Auth section */}
            {isLoggedIn ? (
              <div className="nb-mobile-user">
                <div className="nb-mobile-user-info">
                  <div className="nb-avatar nb-avatar--lg">{(username || 'U')[0].toUpperCase()}</div>
                  <div>
                    <p className="nb-mobile-uname">{username}</p>
                    {userRole === 'admin' && <span className="nb-admin-tag">Admin</span>}
                  </div>
                </div>
                <Link to="/profile" className="nb-mobile-link" onClick={() => setMenuOpen(false)}>Profile</Link>
                {userRole !== 'admin' && (
                  <Link to="/orders" className="nb-mobile-link" onClick={() => setMenuOpen(false)}>My Orders</Link>
                )}
                {userRole === 'admin' && (
                  <>
                    <Link to="/AdminProducts" className="nb-mobile-link" onClick={() => setMenuOpen(false)}>Manage Products</Link>
                    <Link to="/AdminOrders" className="nb-mobile-link" onClick={() => setMenuOpen(false)}>Manage Orders</Link>
                  </>
                )}
                <button className="nb-mobile-logout" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <div className="nb-mobile-auth">
                <Link to="/login" className="nb-mobile-login" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="nb-mobile-signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <style>{`
        /* ── Root ── */
        .nb-root {
          background: #fff;
          border-bottom: 1px solid #F0F0F0;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .nb-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 16px;
          height: 60px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        @media (min-width: 640px) { .nb-inner { padding: 0 24px; height: 64px; } }
        @media (min-width: 1024px) { .nb-inner { padding: 0 40px; gap: 32px; } }

        /* ── Logo ── */
        .nb-logo {
          font-size: 18px;
          font-weight: 900;
          color: #111;
          text-decoration: none;
          letter-spacing: -0.5px;
          flex-shrink: 0;
          margin-right: auto;
        }
        @media (min-width: 640px) { .nb-logo { font-size: 20px; } }

        /* ── Desktop links ── */
        .nb-links {
          display: none;
          align-items: center;
          gap: 4px;
          margin-right: auto;
        }
        @media (min-width: 768px) { .nb-links { display: flex; } }

        .nb-link {
          font-size: 14px;
          font-weight: 500;
          color: #6B7280;
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .nb-link:hover { color: #111; background: #F3F4F6; }
        .nb-link--active { color: #111; font-weight: 700; background: #F3F4F6; }

        /* ── Actions row ── */
        .nb-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        @media (min-width: 640px) { .nb-actions { gap: 8px; } }

        /* Icon buttons */
        .nb-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: none;
          color: #374151;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s;
          flex-shrink: 0;
        }
        .nb-icon-btn:hover { background: #F3F4F6; color: #111; }

        /* Search */
        .nb-search-wrap { display: none; }
        @media (min-width: 768px) { .nb-search-wrap { display: flex; align-items: center; } }

        .nb-search-form {
          display: flex;
          align-items: center;
          gap: 0;
          background: #F9FAFB;
          border: 1.5px solid #E5E7EB;
          border-radius: 40px;
          padding: 0 10px;
          height: 36px;
          min-width: 200px;
          position: relative;
          transition: border-color 0.2s;
        }
        .nb-search-form:focus-within { border-color: #111; }
        .nb-search-ico { flex-shrink: 0; margin-right: 6px; }
        .nb-search-input {
          border: none;
          background: none;
          outline: none;
          font-size: 13px;
          color: #111;
          flex: 1;
          min-width: 0;
        }

        /* Cart */
        .nb-cart-btn {
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #374151;
          text-decoration: none;
          border-radius: 50%;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .nb-cart-btn:hover { background: #F3F4F6; color: #111; }
        .nb-cart-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #111;
          color: #fff;
          font-size: 9px;
          font-weight: 800;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid #fff;
        }

        /* User */
        .nb-user-wrap { position: relative; display: none; }
        @media (min-width: 768px) { .nb-user-wrap { display: block; } }

        .nb-user-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px 4px 4px;
          border: 1.5px solid #E5E7EB;
          border-radius: 40px;
          background: #fff;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .nb-user-btn:hover { border-color: #111; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

        .nb-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #111;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .nb-avatar--lg { width: 40px; height: 40px; font-size: 16px; }

        .nb-username {
          font-size: 13px;
          font-weight: 600;
          color: #111;
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .nb-admin-tag {
          background: #FEF2F2;
          color: #DC2626;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 20px;
          white-space: nowrap;
        }

        /* Dropdown */
        .nb-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 200px;
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          overflow: hidden;
          z-index: 200;
        }
        .nb-dropdown-header {
          padding: 14px 16px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid #F3F4F6;
        }
        .nb-dropdown-name {
          font-size: 13px;
          font-weight: 700;
          color: #111;
          margin: 0;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .nb-dropdown-body { padding: 6px; }
        .nb-dropdown-item {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 12px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          text-decoration: none;
          transition: background 0.15s;
          width: 100%;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
        }
        .nb-dropdown-item:hover { background: #F3F4F6; color: #111; }
        .nb-dropdown-divider { height: 1px; background: #F3F4F6; margin: 4px 0; }
        .nb-dropdown-logout { color: #EF4444; }
        .nb-dropdown-logout:hover { background: #FEF2F2; color: #DC2626; }

        /* Auth buttons */
        .nb-auth { display: none; align-items: center; gap: 6px; }
        @media (min-width: 768px) { .nb-auth { display: flex; } }

        .nb-login-btn {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .nb-login-btn:hover { background: #F3F4F6; }

        .nb-signup-btn {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          background: #111;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 8px;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .nb-signup-btn:hover { background: #374151; }

        /* Hamburger */
        .nb-hamburger {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          background: none;
          cursor: pointer;
          color: #374151;
          border-radius: 8px;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .nb-hamburger:hover { background: #F3F4F6; }
        @media (min-width: 768px) { .nb-hamburger { display: none; } }

        /* ── Mobile drawer ── */
        .nb-mobile-drawer {
          border-top: 1px solid #F0F0F0;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: #fff;
        }

        .nb-mobile-search {
          position: relative;
          margin-bottom: 8px;
        }
        .nb-mobile-search-input {
          width: 100%;
          border: 1.5px solid #E5E7EB;
          border-radius: 40px;
          padding: 10px 16px 10px 38px;
          font-size: 14px;
          outline: none;
          color: #111;
          background: #F9FAFB;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .nb-mobile-search-input:focus { border-color: #111; background: #fff; }

        .nb-mobile-links { display: flex; flex-direction: column; gap: 2px; }
        .nb-mobile-link {
          display: block;
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          color: #374151;
          text-decoration: none;
          transition: background 0.15s;
        }
        .nb-mobile-link:hover { background: #F3F4F6; color: #111; }
        .nb-mobile-link--active { background: #F3F4F6; color: #111; font-weight: 700; }

        .nb-mobile-divider { height: 1px; background: #F3F4F6; margin: 8px 0; }

        .nb-mobile-user { display: flex; flex-direction: column; gap: 2px; }
        .nb-mobile-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          margin-bottom: 4px;
        }
        .nb-mobile-uname { font-size: 14px; font-weight: 700; color: #111; margin: 0 0 4px; }

        .nb-mobile-logout {
          display: block;
          width: 100%;
          text-align: left;
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          color: #EF4444;
          background: none;
          border: none;
          cursor: pointer;
          margin-top: 4px;
          transition: background 0.15s;
        }
        .nb-mobile-logout:hover { background: #FEF2F2; }

        .nb-mobile-auth { display: flex; flex-direction: column; gap: 8px; padding-top: 4px; }
        .nb-mobile-login {
          display: block;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          color: #374151;
          text-decoration: none;
          text-align: center;
          border: 1.5px solid #E5E7EB;
          transition: border-color 0.2s;
        }
        .nb-mobile-login:hover { border-color: #111; color: #111; }
        .nb-mobile-signup {
          display: block;
          padding: 13px 14px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          background: #111;
          text-decoration: none;
          text-align: center;
          transition: background 0.2s;
        }
        .nb-mobile-signup:hover { background: #374151; }
      `}</style>
    </>
  );
}