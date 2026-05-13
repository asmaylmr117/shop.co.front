import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Reavel from '../Reavel'
import { motion } from 'framer-motion'
import BrandsBar from '../components/BrandsBar'
import HappyCustomers from '../components/HappyCustomers'

// ─── Reusable Product Card ────────────────────────────────────────────────────
function ProductCard({ product, index }) {
  return (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: 'easeOut' }}
      className="product-card"
    >
      {/* Image */}
      <div className="card-image-wrap">
        {product.discount > 0 && (
          <span className="badge-discount">-{product.discount}%</span>
        )}
        {product.image_data ? (
          <img
            src={`data:image/jpeg;base64,${product.image_data}`}
            alt={product.name}
            className="card-image"
          />
        ) : (
          <div className="card-image-placeholder">
            <span>No Image</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card-body">
        <h3 className="card-title">{product.name}</h3>

        <div className="card-meta">
          <div className="card-price-row">
            <span className="card-price">${product.price}</span>
            <div className="card-stars">
              {'★★★★★'.slice(0, Math.round(product.stars)).split('').map((s, i) => (
                <span key={i} className="star filled">★</span>
              ))}
              {'★★★★★'.slice(Math.round(product.stars)).split('').map((s, i) => (
                <span key={i} className="star empty">★</span>
              ))}
              <span className="stars-num">{product.stars}</span>
            </div>
          </div>

          <Link
            to={`/Shop/${encodeURIComponent(product.name)}`}
            className="card-btn"
          >
            View Product
          </Link>
        </div>
      </div>

      <style>{`
        .product-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07);
          transition: box-shadow 0.25s, transform 0.25s;
          display: flex;
          flex-direction: column;
        }
        .product-card:hover {
          box-shadow: 0 8px 28px rgba(0,0,0,0.13);
          transform: translateY(-3px);
        }
        .card-image-wrap {
          position: relative;
          background: #f4f4f4;
          aspect-ratio: 1 / 1;
          overflow: hidden;
        }
        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .product-card:hover .card-image {
          transform: scale(1.06);
        }
        .card-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #aaa;
          font-size: 13px;
        }
        .badge-discount {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #111;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 20px;
          z-index: 1;
          letter-spacing: 0.5px;
        }
        .card-body {
          padding: 12px 14px 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 10px;
        }
        .card-title {
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
        .card-meta {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: auto;
        }
        .card-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .card-price {
          font-size: 16px;
          font-weight: 800;
          color: #111;
        }
        .card-stars {
          display: flex;
          align-items: center;
          gap: 1px;
        }
        .star {
          font-size: 12px;
        }
        .star.filled { color: #f5a623; }
        .star.empty  { color: #ddd; }
        .stars-num {
          font-size: 12px;
          color: #888;
          margin-left: 3px;
        }
        .card-btn {
          display: block;
          width: 100%;
          text-align: center;
          background: #111;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          padding: 10px 0;
          border-radius: 10px;
          text-decoration: none;
          transition: background 0.2s;
          letter-spacing: 0.3px;
        }
        .card-btn:hover { background: #333; }
      `}</style>
    </motion.div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function ProductSection({ title, products, sectionRef, viewAllLink }) {
  return (
    <section ref={sectionRef} className="section-wrap">
      <div className="section-header">
        <Reavel>
          <h2 className="section-title">{title}</h2>
        </Reavel>
        {viewAllLink && (
          <Link to={viewAllLink} className="section-link">View all →</Link>
        )}
      </div>

      {/* Mobile: horizontal scroll  |  Desktop: grid */}
      <div className="cards-scroll-wrapper">
        <div className="cards-grid">
          {products.map((product, index) => (
            <ProductCard key={product.id || index} product={product} index={index} />
          ))}
        </div>
      </div>

      <style>{`
        .section-wrap {
          padding: 36px 16px 28px;
          background: #fafafa;
        }
        @media (min-width: 640px) {
          .section-wrap { padding: 48px 24px 36px; }
        }
        @media (min-width: 1024px) {
          .section-wrap { padding: 64px 48px 48px; }
        }

        .section-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .section-title {
          font-size: clamp(20px, 5vw, 32px);
          font-weight: 800;
          color: #111;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .section-link {
          font-size: 13px;
          font-weight: 600;
          color: #555;
          text-decoration: none;
          white-space: nowrap;
          margin-left: 12px;
        }
        .section-link:hover { color: #111; }

        /* ── Mobile: horizontal scroll ── */
        .cards-scroll-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 8px;
        }
        .cards-scroll-wrapper::-webkit-scrollbar { display: none; }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 160px);
          gap: 12px;
          width: max-content;
        }

        /* ── Tablet: 2-col normal grid ── */
        @media (min-width: 480px) {
          .cards-scroll-wrapper { overflow-x: visible; }
          .cards-grid {
            grid-template-columns: repeat(2, 1fr);
            width: auto;
            gap: 14px;
          }
        }

        /* ── Desktop: 4-col ── */
        @media (min-width: 1024px) {
          .cards-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
        }
      `}</style>
    </section>
  )
}

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function Home({ to = '' }) {
  const NewArrival = useRef()
  const TopSelling = useRef()
  const OnSale = useRef()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
    fetchCategories()

    if (to === '') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const refs = { NewArrival, TopSelling, OnSale }
    if (refs[to]?.current) {
      window.scrollTo({ top: refs[to].current.offsetTop, behavior: 'smooth' })
    }
  }, [to])

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://shopbackco.vercel.app/api/products/')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else throw new Error('Failed to fetch products')
    } catch (err) {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://shopbackco.vercel.app/api/products/meta/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const newArrivals = products.slice(4, 8)
  const topSelling = products.filter(p => p.stars >= 4).sort((a, b) => b.stars - a.stars).slice(0, 4)
  const onSale     = products.filter(p => p.discount > 0).sort((a, b) => b.discount - a.discount).slice(0, 4)
  const featured   = products.slice(0, 4)

  return (
    <>
      {/* ── Hero ── */}
      <div className="pt-1 nav:flex flex-wrap justify-between items-end mainPadding">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full">
          <div className="nav:w-full lg:w-1/2 flex flex-col flex-grow lg:pr-10">
            <h1 className="bolded text-2xl sm:text-4xl md:text-6xl mb-5 sm:mb-10 max-w-[550px] whitespace-nowrap">
              <Reavel>FIND CLOTHES</Reavel>
              <Reavel>THAT MATCHES</Reavel>
              <Reavel>YOUR STYLE</Reavel>
            </h1>
            <p className="max-w-[550px] text-sm sm:text-base md:text-lg">
              Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
            </p>
            <div className='mt-10' />
            <Reavel className='btnReavel flex' btn='w-full lg:w-fit'>
              <Link className="btn w-full lg:w-fit text-center hover:bg-gray-600" to='Shop'>Shop Now</Link>
            </Reavel>
            <div className='mb-10' />
            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4">
              <div className="flex justify-center items-center gap-2 w-full sm:w-auto">
                <div className="flex flex-col justify-center items-center border-r border-gray-300 pr-3">
                  <Reavel><h1 className="font-bold text-2xl sm:text-3xl tracking-wide">200+</h1></Reavel>
                  <Reavel><p className="whitespace-nowrap">International Brands</p></Reavel>
                </div>
                <div className="flex flex-col justify-center items-center border-r border-gray-300 pr-3">
                  <Reavel><h1 className="font-bold text-2xl sm:text-3xl tracking-wide">{products.length}+</h1></Reavel>
                  <Reavel><p className="whitespace-nowrap">High-Quality Products</p></Reavel>
                </div>
              </div>
              <div className="flex flex-col justify-center items-center w-full sm:w-auto mt-4 sm:mt-0">
                <Reavel><h1 className="font-bold text-2xl sm:text-3xl tracking-wide">30,000+</h1></Reavel>
                <Reavel><p>Happy Customers</p></Reavel>
              </div>
            </div>
          </div>

          <div
            className="lg:w-1/2 w-full h-screen"
            style={{ width: '100vw', height: '85%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
          >
            <img
              src="heroimg.png"
              alt="Stylish couple wearing fashionable clothes"
              style={{ width: '100vw', height: '85%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>

      <BrandsBar />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mx-5 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
        </div>
      ) : (
        <>
          <div ref={NewArrival}>
            <ProductSection
              title="New Arrivals"
              products={newArrivals}
              viewAllLink="/Shop"
            />
          </div>

          <div ref={TopSelling}>
            <ProductSection
              title="Top Selling"
              products={topSelling}
              viewAllLink="/Shop"
            />
          </div>

          <div ref={OnSale}>
            <ProductSection
              title="On Sale"
              products={onSale}
              viewAllLink="/Shop"
            />
          </div>

          <ProductSection
            title="Featured Products"
            products={featured}
            viewAllLink="/Shop"
          />

          {/* View All button */}
          <div className="text-center py-8 bg-fafafa">
            <Link
              to="/Shop"
              className="inline-block bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold"
            >
              View All Products
            </Link>
          </div>
        </>
      )}

      <HappyCustomers />
    </>
  )
}
