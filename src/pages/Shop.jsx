import { useEffect, useState } from 'react';
import { IoIosArrowForward } from 'react-icons/io';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaSpinner } from 'react-icons/fa';

// ── Star Rating ───────────────────────────────────────────────────────────────
function StarRating({ rating = 0 }) {
  const num = parseFloat(rating) || 0;
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <FaStar key={i} size={11} color={i <= Math.round(num) ? '#FBBF24' : '#E5E7EB'} />
      ))}
      <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 4 }}>{num}</span>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5), duration: 0.35, ease: 'easeOut' }}
      className="shop-card"
    >
      {/* Image */}
      <div className="shop-card-img-wrap">
        {product.discount > 0 && (
          <span className="shop-badge">-{product.discount}%</span>
        )}
        {product.image_data ? (
          <img
            src={`data:image/jpeg;base64,${product.image_data}`}
            alt={product.name}
            className="shop-card-img"
          />
        ) : (
          <div className="shop-card-no-img">
            <span>No Image</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="shop-card-body">
        <h3 className="shop-card-name">{product.name || 'Unnamed Product'}</h3>
        <p className="shop-card-desc">{product.description || 'No description available'}</p>

        <div className="shop-card-footer">
          <div className="shop-card-price-row">
            <span className="shop-card-price">${product.price || '—'}</span>
            <StarRating rating={product.stars} />
          </div>
          <Link
            to={`/Shop/${encodeURIComponent(product.name || 'product')}`}
            className="shop-card-btn"
          >
            View Product
          </Link>
        </div>
      </div>

      <style>{`
        .shop-card {
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid #F0F0F0;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .shop-card:hover {
          box-shadow: 0 10px 32px rgba(0,0,0,0.12);
          transform: translateY(-4px);
        }
        .shop-card-img-wrap {
          position: relative;
          background: #F4F4F5;
          aspect-ratio: 1 / 1;
          overflow: hidden;
        }
        .shop-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.45s ease;
        }
        .shop-card:hover .shop-card-img { transform: scale(1.07); }
        .shop-card-no-img {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #C4C4C4;
          font-size: 12px;
        }
        .shop-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #111;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          padding: 3px 9px;
          border-radius: 20px;
          z-index: 1;
          letter-spacing: 0.4px;
        }
        .shop-card-body {
          padding: 14px 14px 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 8px;
        }
        .shop-card-name {
          font-size: 14px;
          font-weight: 700;
          color: #111;
          margin: 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .shop-card-desc {
          font-size: 12px;
          color: #9CA3AF;
          margin: 0;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .shop-card-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .shop-card-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .shop-card-price {
          font-size: 16px;
          font-weight: 900;
          color: #111;
          letter-spacing: -0.3px;
        }
        .shop-card-btn {
          display: block;
          width: 100%;
          text-align: center;
          background: #111;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          padding: 10px 0;
          border-radius: 10px;
          text-decoration: none;
          letter-spacing: 0.4px;
          transition: background 0.2s;
        }
        .shop-card-btn:hover { background: #374151; }
      `}</style>
    </motion.div>
  );
}

// ── Main Shop Page ────────────────────────────────────────────────────────────
export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://shopbackco.vercel.app/api/products');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        let arr = [];
        if (Array.isArray(data)) arr = data;
        else if (data?.products) arr = data.products;
        else if (data?.data) arr = data.data;
        else {
          const vals = Object.values(data).filter(v => Array.isArray(v));
          if (vals.length) arr = vals[0];
        }

        setProducts(arr);
        setError(null);

        const query = new URLSearchParams(location.search).get('search')?.trim().toLowerCase();
        if (query) {
          const match = arr.find(p => p.name?.toLowerCase() === query);
          if (match) navigate(`/Shop/${encodeURIComponent(match.name)}`);
        }
      } catch (err) {
        setError(`Failed to load products: ${err.message}`);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate, location.search]);

  const filtered = search.trim()
    ? products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  // ── Loading ──
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <FaSpinner size={32} color="#111" style={{ animation: 'shopSpin 0.8s linear infinite' }} />
      <style>{`@keyframes shopSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12, padding: 24 }}>
      <p style={{ fontSize: 16, color: '#EF4444', fontWeight: 600 }}>Something went wrong</p>
      <p style={{ fontSize: 13, color: '#9CA3AF' }}>{error}</p>
      <button
        onClick={() => window.location.reload()}
        style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="shop-page">

      {/* ── Top bar ── */}
      <div className="shop-topbar">
        <div className="shop-breadcrumb">
          <Link to="/" className="bc-home">Home</Link>
          <IoIosArrowForward color="#9CA3AF" size={14} />
          <span className="bc-current">Shop</span>
        </div>

        <div className="shop-meta">
          <span className="shop-count">{filtered.length} products</span>
          <div className="shop-search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="shop-search"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="shop-empty">
          <span>🛍️</span>
          <p>No products found{search ? ` for "${search}"` : '.'}</p>
          {search && (
            <button className="clear-search" onClick={() => setSearch('')}>Clear search</button>
          )}
        </div>
      ) : (
        <div className="shop-grid">
          {filtered.map((product, index) => (
            <ProductCard key={product.id || index} product={product} index={index} />
          ))}
        </div>
      )}

      <style>{`
        .shop-page {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px 16px 60px;
        }
        @media (min-width: 640px) {
          .shop-page { padding: 32px 24px 72px; }
        }
        @media (min-width: 1024px) {
          .shop-page { padding: 40px 48px 80px; }
        }

        /* Top bar */
        .shop-topbar {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 28px;
        }
        @media (min-width: 640px) {
          .shop-topbar {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .shop-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bc-home {
          font-size: 13px;
          color: #9CA3AF;
          text-decoration: none;
          transition: color 0.2s;
        }
        .bc-home:hover { color: #111; }
        .bc-current {
          font-size: 13px;
          font-weight: 700;
          color: #111;
        }

        .shop-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .shop-count {
          font-size: 12px;
          color: #9CA3AF;
          font-weight: 600;
          white-space: nowrap;
        }
        .shop-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 10px;
          font-size: 13px;
          pointer-events: none;
        }
        .shop-search {
          border: 1.5px solid #E5E7EB;
          border-radius: 40px;
          padding: 8px 16px 8px 34px;
          font-size: 13px;
          outline: none;
          width: 200px;
          transition: border-color 0.2s, width 0.3s;
          background: #fff;
          color: #111;
        }
        .shop-search:focus {
          border-color: #111;
          width: 240px;
        }
        @media (max-width: 400px) {
          .shop-search { width: 160px; }
          .shop-search:focus { width: 180px; }
        }

        /* Grid */
        .shop-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 640px) {
          .shop-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }
        @media (min-width: 900px) {
          .shop-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
        }
        @media (min-width: 1200px) {
          .shop-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }

        /* Empty */
        .shop-empty {
          text-align: center;
          padding: 64px 24px;
          color: #9CA3AF;
        }
        .shop-empty span { font-size: 48px; display: block; margin-bottom: 12px; }
        .shop-empty p { font-size: 15px; margin: 0 0 16px; }
        .clear-search {
          background: #111;
          color: #fff;
          border: none;
          padding: 9px 20px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}