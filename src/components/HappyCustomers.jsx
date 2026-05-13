import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaStar, FaSpinner } from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'

const API_BASE_URL = 'https://shopbackco.vercel.app/api'

// ── Star Rating ───────────────────────────────────────────────────────────────
function StarRating({ rating = 5, size = 14 }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <FaStar key={i} size={size} color={i <= rating ? '#FBBF24' : '#E5E7EB'} />
      ))}
    </div>
  )
}

// ── Review Card ───────────────────────────────────────────────────────────────
function ReviewCard({ review, index }) {
  const date = review.createdAt || review.created_at || review.date
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
      className="review-card"
    >
      <StarRating rating={review.rating} />

      <p className="review-text">"{review.review || 'Great experience!'}"</p>

      <div className="review-footer">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {(review.name || 'A')[0].toUpperCase()}
          </div>
          <div>
            <div className="reviewer-name">
              {review.name || 'Anonymous'}
              <MdVerified size={14} color="#10B981" style={{ marginLeft: 4, display: 'inline' }} />
            </div>
            {date && (
              <div className="reviewer-date">
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .review-card {
          background: #fff;
          border: 1px solid #F0F0F0;
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 280px;
          max-width: 340px;
          flex-shrink: 0;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          transition: box-shadow 0.25s, transform 0.25s;
          position: relative;
          overflow: hidden;
        }
        .review-card::before {
          content: '"';
          position: absolute;
          top: -10px;
          right: 20px;
          font-size: 100px;
          color: #F9FAFB;
          font-family: Georgia, serif;
          line-height: 1;
          pointer-events: none;
          z-index: 0;
        }
        .review-card:hover {
          box-shadow: 0 12px 40px rgba(0,0,0,0.11);
          transform: translateY(-4px);
        }
        .review-text {
          font-size: 14px;
          color: #374151;
          line-height: 1.65;
          flex: 1;
          position: relative;
          z-index: 1;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .review-footer {
          border-top: 1px solid #F3F4F6;
          padding-top: 14px;
        }
        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .reviewer-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #111 0%, #444 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .reviewer-name {
          font-size: 13px;
          font-weight: 700;
          color: #111;
          display: flex;
          align-items: center;
        }
        .reviewer-date {
          font-size: 11px;
          color: #9CA3AF;
          margin-top: 2px;
        }
      `}</style>
    </motion.div>
  )
}

// ── Add Review Modal ──────────────────────────────────────────────────────────
function AddReviewModal({ onClose, onSubmit, submitting }) {
  const [form, setForm] = useState({ name: '', review: '', rating: 5 })

  const handleSubmit = () => {
    if (!form.name.trim() || form.name.trim().length < 2) return alert('Name must be at least 2 characters.')
    if (!form.review.trim() || form.review.trim().length < 10) return alert('Review must be at least 10 characters.')
    onSubmit({ name: form.name.trim(), review: form.review.trim(), rating: form.rating })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 20 }}
        className="modal-box"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Share Your Experience</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Star picker */}
        <div className="field-group">
          <label>Your Rating</label>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <button
                key={i}
                onClick={() => setForm(f => ({ ...f, rating: i }))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
              >
                <FaStar size={24} color={i <= form.rating ? '#FBBF24' : '#D1D5DB'} />
              </button>
            ))}
          </div>
        </div>

        <div className="field-group">
          <label>Your Name</label>
          <input
            className="field-input"
            placeholder="e.g. Sarah M."
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            maxLength={50}
          />
        </div>

        <div className="field-group">
          <label>Your Review</label>
          <textarea
            className="field-input field-textarea"
            placeholder="Tell others about your experience..."
            value={form.review}
            onChange={e => setForm(f => ({ ...f, review: e.target.value }))}
            maxLength={500}
          />
          <span className="char-count">{form.review.length}/500</span>
        </div>

        <button
          className="modal-submit"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <FaSpinner className="spin-icon" /> : 'Submit Review'}
        </button>
      </motion.div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(6px);
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .modal-box {
          background: #fff;
          border-radius: 24px;
          padding: 28px 24px;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.2);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-header h3 {
          font-size: 20px;
          font-weight: 800;
          color: #111;
          margin: 0;
        }
        .modal-close {
          background: #F3F4F6;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 13px;
          color: #555;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .modal-close:hover { background: #E5E7EB; }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .field-group label {
          font-size: 12px;
          font-weight: 700;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .field-input {
          border: 1.5px solid #E5E7EB;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          color: #111;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
          width: 100%;
          box-sizing: border-box;
        }
        .field-input:focus { border-color: #111; }
        .field-textarea {
          height: 90px;
          resize: none;
        }
        .char-count {
          font-size: 11px;
          color: #9CA3AF;
          text-align: right;
          margin-top: 2px;
        }
        .modal-submit {
          background: #111;
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .modal-submit:hover:not(:disabled) { background: #333; }
        .modal-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .spin-icon { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HappyCustomers() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const trackRef = useRef()

  const fetchReviews = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/`)
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      const arr = Array.isArray(data) ? data
        : Array.isArray(data.reviews) ? data.reviews
        : Array.isArray(data.data) ? data.data : []
      setReviews(arr)
    } catch (e) {
      setError('Could not load reviews.')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const addReview = async (payload) => {
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error()
      const created = await res.json()
      setReviews(prev => [...prev, created])
      setShowModal(false)
    } catch {
      alert('Could not submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => { fetchReviews() }, [])

  const total = reviews.length
  const prev = () => setActiveIdx(i => Math.max(0, i - 1))
  const next = () => setActiveIdx(i => Math.min(total - 1, i + 1))

  // Scroll track on desktop
  useEffect(() => {
    if (!trackRef.current) return
    const card = trackRef.current.children[0]
    if (!card) return
    const gap = 20
    trackRef.current.scrollTo({ left: activeIdx * (card.offsetWidth + gap), behavior: 'smooth' })
  }, [activeIdx])

  return (
    <section className="hc-section">

      {/* ── Header ── */}
      <div className="hc-header">
        <div className="hc-label">Testimonials</div>
        <h2 className="hc-title">What Our Customers<br />Are Saying</h2>
        <p className="hc-sub">Real reviews from real people who love what they wear.</p>
      </div>

      {/* ── Stats row ── */}
      <div className="hc-stats">
        <div className="stat-item">
          <span className="stat-num">30k+</span>
          <span className="stat-lbl">Happy Customers</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <StarRating rating={5} size={16} />
          <span className="stat-lbl">Average Rating</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-num">{total}</span>
          <span className="stat-lbl">Verified Reviews</span>
        </div>
      </div>

      {/* ── Cards ── */}
      {loading ? (
        <div className="hc-loader">
          <FaSpinner size={28} color="#111" style={{ animation: 'spin2 0.8s linear infinite' }} />
        </div>
      ) : error ? (
        <p className="hc-error">{error}</p>
      ) : total === 0 ? (
        <div className="hc-empty">
          <span>📝</span>
          <p>No reviews yet. Be the first!</p>
        </div>
      ) : (
        <>
          <div className="cards-track" ref={trackRef}>
            {reviews.map((r, i) => (
              <ReviewCard key={r.id || i} review={r} index={i} />
            ))}
          </div>

          {/* ── Navigation ── */}
          <div className="hc-nav">
            <button
              className={`nav-btn ${activeIdx === 0 ? 'nav-btn--off' : ''}`}
              onClick={prev}
              disabled={activeIdx === 0}
              aria-label="Previous"
            >
              ←
            </button>

            <div className="nav-dots">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  className={`dot ${i === activeIdx ? 'dot--active' : ''}`}
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>

            <button
              className={`nav-btn ${activeIdx === total - 1 ? 'nav-btn--off' : ''}`}
              onClick={next}
              disabled={activeIdx === total - 1}
              aria-label="Next"
            >
              →
            </button>
          </div>
        </>
      )}

      {/* ── Add Review CTA ── */}
      <div className="hc-cta">
        <p className="cta-text">Had a great experience?</p>
        <button className="cta-btn" onClick={() => setShowModal(true)}>
          + Write a Review
        </button>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {showModal && (
          <AddReviewModal
            onClose={() => setShowModal(false)}
            onSubmit={addReview}
            submitting={submitting}
          />
        )}
      </AnimatePresence>

      <style>{`
        .hc-section {
          background: #F9FAFB;
          padding: 64px 16px 56px;
          overflow: hidden;
        }
        @media (min-width: 640px) {
          .hc-section { padding: 80px 32px 64px; }
        }

        /* Header */
        .hc-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .hc-label {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #6B7280;
          background: #EFEFEF;
          padding: 5px 14px;
          border-radius: 20px;
          margin-bottom: 14px;
        }
        .hc-title {
          font-size: clamp(24px, 6vw, 42px);
          font-weight: 900;
          color: #111;
          margin: 0 0 12px;
          line-height: 1.15;
          letter-spacing: -1px;
        }
        .hc-sub {
          font-size: 15px;
          color: #6B7280;
          margin: 0;
        }

        /* Stats */
        .hc-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          background: #fff;
          border-radius: 20px;
          border: 1px solid #E5E7EB;
          padding: 20px 28px;
          max-width: 560px;
          margin: 0 auto 40px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.05);
        }
        .stat-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .stat-num {
          font-size: 22px;
          font-weight: 900;
          color: #111;
          letter-spacing: -0.5px;
        }
        .stat-lbl {
          font-size: 11px;
          color: #9CA3AF;
          font-weight: 600;
          text-align: center;
        }
        .stat-divider {
          width: 1px;
          height: 40px;
          background: #E5E7EB;
          flex-shrink: 0;
          margin: 0 8px;
        }

        /* Cards track */
        .cards-track {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 8px 4px 16px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .cards-track::-webkit-scrollbar { display: none; }
        .cards-track > * { scroll-snap-align: start; }

        /* On desktop: wrap to grid */
        @media (min-width: 768px) {
          .cards-track {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            overflow-x: visible;
            scroll-snap-type: none;
          }
        }

        /* Navigation */
        .hc-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 8px;
        }
        @media (min-width: 768px) {
          .hc-nav { display: none; }
        }
        .nav-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1.5px solid #E5E7EB;
          background: #fff;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          color: #111;
        }
        .nav-btn:hover:not(:disabled) {
          background: #111;
          color: #fff;
          border-color: #111;
        }
        .nav-btn--off { opacity: 0.3; cursor: not-allowed; }
        .nav-dots {
          display: flex;
          gap: 6px;
        }
        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #D1D5DB;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0;
        }
        .dot--active {
          background: #111;
          width: 20px;
          border-radius: 4px;
        }

        /* CTA */
        .hc-cta {
          text-align: center;
          margin-top: 44px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .cta-text {
          font-size: 15px;
          color: #6B7280;
          margin: 0;
        }
        .cta-btn {
          background: #111;
          color: #fff;
          border: none;
          padding: 13px 28px;
          border-radius: 40px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.3px;
          transition: background 0.2s, transform 0.15s;
        }
        .cta-btn:hover {
          background: #333;
          transform: translateY(-2px);
        }

        /* Loader / empty */
        .hc-loader {
          display: flex;
          justify-content: center;
          padding: 48px;
        }
        .hc-error {
          text-align: center;
          color: #EF4444;
          font-size: 14px;
          padding: 24px;
        }
        .hc-empty {
          text-align: center;
          padding: 40px;
          color: #9CA3AF;
        }
        .hc-empty span { font-size: 40px; display: block; margin-bottom: 10px; }

        @keyframes spin2 { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  )
}
