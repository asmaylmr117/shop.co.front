import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Reavel from '../Reavel'
import { motion } from 'framer-motion'
import BrandsBar from '../components/BrandsBar'

import HappyCustomers from '../components/HappyCustomers'

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
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
      return;
    }
    if (to === 'NewArrival') {
      window.scrollTo({
        top: NewArrival.current?.offsetTop || 0,
        behavior: 'smooth'
      })
    } else if (to === 'TopSelling') {
      window.scrollTo({
        top: TopSelling.current?.offsetTop || 0,
        behavior: 'smooth'
      })
    } else if (to === 'OnSale') {
      window.scrollTo({
        top: OnSale.current?.offsetTop || 0,
        behavior: 'smooth'
      })
    }
  }, [to])

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://shopbackco.vercel.app/api/products/')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        throw new Error('Failed to fetch products')
      }
    } catch (err) {
      setError('Failed to load products')
      console.error('Error fetching products:', err)
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
      console.error('Error fetching categories:', err)
    }
  }

  // Filter products for different sections
  const newArrivals = products.slice(0, 8)
  const topSelling = products
    .filter(product => product.stars >= 4)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 8)
  const onSale = products
    .filter(product => product.discount > 0)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 8)

  return (
    <>
      <div className="pt-1 nav:flex flex-wrap justify-between items-end mainPadding">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full">
          {/* النص */}
          <div className="nav:w-full lg:w-1/2 flex flex-col flex-grow lg:pr-10">
            <h1 className="bolded text-2xl sm:text-4xl md:text-6xl mb-5 sm:mb-10 max-w-[550px] whitespace-nowrap">
              <Reavel>FIND CLOTHES</Reavel> <Reavel>THAT MATCHES</Reavel> <Reavel>YOUR STYLE</Reavel>
            </h1>

            <p className="max-w-[550px] text-sm sm:text-base md:text-lg">
              Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
            </p>

            <div className='mt-10'></div>
            <Reavel className='btnReavel flex' btn='w-full lg:w-fit'>
              <Link className="btn w-full lg:w-fit text-center hover:bg-gray-600" to='Shop'>Shop Now</Link>
            </Reavel>
            <div className='mb-10'></div>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4">
              <div className="flex justify-center items-center gap-2 w-full sm:w-auto">
                <div className="flex flex-col justify-center items-center border-r border-gray-300 pr-3">
                  <Reavel>
                    <h1 className="font-bold text-2xl sm:text-3xl tracking-wide">200+</h1>
                  </Reavel>
                  <Reavel>
                    <p className="whitespace-nowrap">International Brands</p>
                  </Reavel>
                </div>

                <div className="flex flex-col justify-center items-center border-r border-gray-300 pr-3">
                  <Reavel>
                    <h1 className="font-bold text-2xl sm:text-3xl tracking-wide">{products.length}+</h1>
                  </Reavel>
                  <Reavel>
                    <p className="whitespace-nowrap">High-Quality Products</p>
                  </Reavel>
                </div>
              </div>

              <div className="flex flex-col justify-center items-center w-full sm:w-auto mt-4 sm:mt-0">
                <Reavel>
                  <h1 className="font-bold text-2xl sm:text-3xl tracking-wide">30,000+</h1>
                </Reavel>
                <Reavel>
                  <p>Happy Customers</p>
                </Reavel>
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

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mx-5 mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          

           {/* New Arrivals */}
          <div className="mainPadding py-16 bg-gray-50">
            <Reavel>
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">New Arrivals</h2>
            </Reavel>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(4, 8).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                    {product.image_data ? (
                      <img
                        src={`data:image/jpeg;base64,${product.image_data}`}
                        alt={product.name}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          ${product.price}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>

                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600 ml-1">
                          {product.stars}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/Shop/${encodeURIComponent(product.name)}`}
                      className="mt-4 block w-full bg-black text-white text-center py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      View Product
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            </div>

           {/* Top Selling */}
          <div className="mainPadding py-16 bg-gray-50">
            <Reavel>
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Top TopSelling</h2>
            </Reavel>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(2,6).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                    {product.image_data ? (
                      <img
                        src={`data:image/jpeg;base64,${product.image_data}`}
                        alt={product.name}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          ${product.price}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>

                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600 ml-1">
                          {product.stars}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/Shop/${encodeURIComponent(product.name)}`}
                      className="mt-4 block w-full bg-black text-white text-center py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      View Product
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            
          </div>

           {/* On Sale */}
          <div className="mainPadding py-16 bg-gray-50">
            <Reavel>
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">On Sale</h2>
            </Reavel>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(5,9).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                    {product.image_data ? (
                      <img
                        src={`data:image/jpeg;base64,${product.image_data}`}
                        alt={product.name}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          ${product.price}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>

                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600 ml-1">
                          {product.stars}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/Shop/${encodeURIComponent(product.name)}`}
                      className="mt-4 block w-full bg-black text-white text-center py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      View Product
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            
          </div>

          {/* Featured Products */}
          <div className="mainPadding py-16 bg-gray-50">
            <Reavel>
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">FEATURED PRODUCTS</h2>
            </Reavel>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                    {product.image_data ? (
                      <img
                        src={`data:image/jpeg;base64,${product.image_data}`}
                        alt={product.name}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          ${product.price}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>

                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600 ml-1">
                          {product.stars}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/Shop/${encodeURIComponent(product.name)}`}
                      className="mt-4 block w-full bg-black text-white text-center py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      View Product
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/shop"
                className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                View All Products
              </Link>
            </div>
          </div>
        </>
      )}

      <HappyCustomers />
    </>
  )
}
