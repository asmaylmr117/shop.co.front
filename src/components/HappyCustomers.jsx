import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Reavel from '../Reavel'
import { FaStar, FaArrowLeft, FaArrowRight, FaSpinner, FaPlus } from "react-icons/fa"
import { MdVerified, MdError } from "react-icons/md"

const API_BASE_URL = 'https://shopbackco.vercel.app/api'

export default function HappyCustomers() {
  // Initialize with empty array to avoid iteration errors
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [width, setWidth] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newReview, setNewReview] = useState({
    name: '',
    review: '',
    rating: 5
  })
  const [submitting, setSubmitting] = useState(false)

  const ref = useRef()

  // Fetch reviews from API - Method 2: Using async/await with better error handling
  const fetchReviews = async () => {
    setLoading(true)
    setError(null)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/reviews/`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('API Response:', data) // Debug log

      // Multiple safety checks for different API response formats
      let reviewsArray = []

      if (Array.isArray(data)) {
        reviewsArray = data
      } else if (data && Array.isArray(data.reviews)) {
        reviewsArray = data.reviews
      } else if (data && Array.isArray(data.data)) {
        reviewsArray = data.data
      } else if (data && typeof data === 'object' && data.results && Array.isArray(data.results)) {
        reviewsArray = data.results
      } else {
        console.warn('Unexpected API response format:', data)
        reviewsArray = []
      }

      // Update state with the processed array
      setReviews(reviewsArray)

      // Reset current index if it's out of bounds
      if (reviewsArray.length > 0 && currentIndex >= reviewsArray.length) {
        setCurrentIndex(0)
      }

    } catch (err) {
      console.error('Fetch error:', err)

      if (err.name === 'AbortError') {
        setError('Request timeout. Please check your connection.')
      } else if (err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your internet connection.')
      } else {
        setError(`Failed to load reviews: ${err.message}`)
      }

      // Always ensure reviews is an array
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  // Add new review - Method 2: More robust error handling
  const addReview = async (reviewData) => {
    setSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to submit review: ${response.status} - ${errorText}`)
      }

      const newReviewData = await response.json()
      console.log('New review added:', newReviewData)

      // Instead of using spread operator with prev, create new array directly
      const currentReviews = Array.isArray(reviews) ? reviews : []
      const updatedReviews = [...currentReviews, newReviewData]
      setReviews(updatedReviews)

      // Reset form and close it
      setNewReview({ name: '', review: '', rating: 5 })
      setShowAddForm(false)

      alert('Review added successfully!')

    } catch (err) {
      console.error('Add review error:', err)
      alert(`Error adding review: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation
    const name = newReview.name.trim()
    const reviewText = newReview.review.trim()

    if (!name || !reviewText) {
      alert('Please fill in all required fields')
      return
    }

    if (name.length < 2) {
      alert('Name must be at least 2 characters long')
      return
    }

    if (reviewText.length < 10) {
      alert('Review must be at least 10 characters long')
      return
    }

    addReview({
      name: name,
      review: reviewText,
      rating: parseInt(newReview.rating)
    })
  }

  // Update width for dragging
  useEffect(() => {
    if (ref.current && Array.isArray(reviews) && reviews.length > 0) {
      const newWidth = ref.current.scrollWidth - ref.current.offsetWidth
      setWidth(Math.max(0, newWidth))
    }
  }, [reviews])

  // Fetch reviews on mount
  useEffect(() => {
    fetchReviews()
  }, [])

  // Safe navigation functions
  const nextCustomer = () => {
    const reviewsLength = Array.isArray(reviews) ? reviews.length : 0
    if (reviewsLength > 0 && currentIndex < reviewsLength - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const prevCustomer = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  // Render stars component
  const StarRating = ({ rating }) => {
    const stars = []
    const numRating = typeof rating === 'number' ? rating : 5

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= numRating ? 'text-yellow-400' : 'text-gray-300'}
        />
      )
    }
    return <div className='flex gap-1'>{stars}</div>
  }

  // Get safe reviews array
  const safeReviews = Array.isArray(reviews) ? reviews : []
  const reviewsCount = safeReviews.length
  const hasReviews = reviewsCount > 0

  // Loading component
  const LoadingComponent = () => (
    <div className='mainMargin pb-10 pt-20'>
      <div className='flex flex-col justify-center items-center h-64'>
        <FaSpinner className='animate-spin text-4xl text-blue-500 mb-4' />
        <span className='text-xl text-gray-600'>Loading reviews...</span>
      </div>
    </div>
  )

  // Error component
  const ErrorComponent = () => (
    <div className='mainMargin pb-10 pt-20'>
      <div className='flex flex-col items-center justify-center h-64 text-center'>
        <MdError className='text-5xl text-red-500 mb-4' />
        <p className='text-xl text-red-600 mb-4'>{error}</p>
        <button
          onClick={fetchReviews}
          className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors'
          disabled={loading}
        >
          {loading ? 'Retrying...' : 'Try Again'}
        </button>
      </div>
    </div>
  )

  if (loading) return <LoadingComponent />
  if (error && !hasReviews) return <ErrorComponent />

  return (
    <div className='mainMargin pb-10 pt-20'>
      {/* Title */}
      <h1 className='bolded text-2xl xsm:text-3xl sm:text-5xl text-center flex flex-wrap justify-center gap-2'>
        <span className="block xsm:inline">OUR HAPPY</span>
        <span className="block xsm:inline">CUSTOMERS</span>
      </h1>

      {/* Add Review Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className='bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors'
        >
          <FaPlus className={`transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
          {showAddForm ? 'Cancel' : 'Add Review'}
        </button>
      </div>

      {/* Add Review Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg border"
        >
          <h3 className='text-xl font-bold mb-6 text-center text-gray-800'>Add New Review</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Name *</label>
              <input
                type="text"
                value={newReview.name}
                onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                maxLength={50}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Rating *</label>
              <select
                value={newReview.rating}
                onChange={(e) => setNewReview(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                <option value={3}>⭐⭐⭐ (3 Stars)</option>
                <option value={2}>⭐⭐ (2 Stars)</option>
                <option value={1}>⭐ (1 Star)</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Review *</label>
              <textarea
                value={newReview.review}
                onChange={(e) => setNewReview(prev => ({ ...prev, review: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                placeholder="Share your experience..."
                maxLength={500}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {newReview.review.length}/500 characters
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Reviews Count & Status */}
      <div className='text-center mt-8'>
        <p className='text-lg text-gray-600'>
          {hasReviews ? `Total Reviews: ${reviewsCount}` : 'No reviews available'}
        </p>
        {error && hasReviews && (
          <p className='text-sm text-red-500 mt-2'>
            Warning: {error}
          </p>
        )}
      </div>

      {/* Mobile Navigation - FIXED */}
      {hasReviews && (
        <div className="flex justify-center items-center gap-3 sm:gap-6 mt-6 md:hidden">
          <button
            onClick={prevCustomer}
            disabled={currentIndex === 0}
            className={`p-2 rounded-full flex-shrink-0 ${currentIndex === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
              } transition-colors`}
          >
            <FaArrowLeft size={18} />
          </button>

          <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0">
            {currentIndex + 1} of {reviewsCount}
          </span>

          <button
            onClick={nextCustomer}
            disabled={currentIndex === reviewsCount - 1}
            className={`p-2 rounded-full flex-shrink-0 ${currentIndex === reviewsCount - 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
              } transition-colors`}
          >
            <FaArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Reviews Display */}
      {hasReviews ? (
        <div className="overflow-hidden mt-8" ref={ref}>
          <motion.div
            drag='x'
            dragConstraints={{ left: -width, right: 0 }}
            whileTap={{ cursor: "grabbing" }}
            className="flex gap-8 cursor-grab w-fit"
          >
            {safeReviews.map((review, index) => (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={review.id || `review-${index}`}
                className={`flex flex-col gap-4 w-[350px] h-[250px] ${index === currentIndex ? 'block' : 'hidden'
                  } sm:block bg-white p-6 rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300 overflow-y-auto`}
              >
                <Reavel>
                  <StarRating rating={review.rating} />
                </Reavel>

                <Reavel>
                  <div className='flex gap-2 items-center'>
                    <h2 className='font-bold text-lg text-gray-800'>
                      {review.name || 'Anonymous'}
                    </h2>
                    <MdVerified size={18} className="text-green-500" />
                  </div>
                </Reavel>

                <Reavel>
                  <p className='text-gray-700 leading-relaxed text-sm line-clamp-4'>
                    {review.review || 'No review text available'}
                  </p>
                </Reavel>

                {(review.createdAt || review.created_at || review.date) && (
                  <Reavel>
                    <p className='text-xs text-gray-500'>
                      {new Date(review.createdAt || review.created_at || review.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </Reavel>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      ) : (
        <div className='text-center mt-12 py-12'>
          <div className="text-6xl mb-4">📝</div>
          <p className='text-2xl text-gray-500 mb-2'>No reviews yet</p>
          <p className='text-gray-400'>Be the first to share your experience!</p>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center mt-12">
        <button
          onClick={fetchReviews}
          disabled={loading}
          className='bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors'
        >
          {loading ? 'Refreshing...' : 'Refresh Reviews'}
        </button>
      </div>
    </div>
  )
}
