import { useEffect, useState } from 'react';
import { IoIosArrowForward } from 'react-icons/io';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Add useNavigate, useLocation
import { motion } from 'framer-motion';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation(); // Hook to access URL parameters

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch products from API
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://shopbackco.vercel.app/api/products');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        let productsArray = [];
        if (Array.isArray(data)) {
          productsArray = data;
        } else if (data && Array.isArray(data.products)) {
          productsArray = data.products;
        } else if (data && Array.isArray(data.data)) {
          productsArray = data.data;
        } else if (data && typeof data === 'object') {
          const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            productsArray = possibleArrays[0];
          }
        }

        console.log('API Response:', data);
        console.log('Processed Products:', productsArray);

        setProducts(productsArray);
        setError(null);

        // Check for search query in URL
        const queryParams = new URLSearchParams(location.search);
        const searchQuery = queryParams.get('search')?.trim().toLowerCase();

        if (searchQuery) {
          const matchedProduct = productsArray.find(
            (product) => product.name?.toLowerCase() === searchQuery
          );
          if (matchedProduct) {
            // Redirect to the product page
            navigate(`/Shop/${encodeURIComponent(matchedProduct.name)}`);
          } else {
            // Optionally, you can set an error or show a message
            console.log('No product found for search query:', searchQuery);
          }
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          url: 'https://shopbackco.vercel.app/api/products',
        });
        setError(`Failed to load products: ${err.message}`);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate, location.search]); // Add dependencies

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">Error loading products</div>
        <div className="text-gray-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mainMargin">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="text-gray-400">Home</Link>
        <IoIosArrowForward color="gray" />
        <p>Shop</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id || index}
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
                {product.name || 'Unnamed Product'}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.description || 'No description available'}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900">
                    ${product.price || 'N/A'}
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
                    {product.stars || 'N/A'}
                  </span>
                </div>
              </div>

              <Link
                to={`/Shop/${encodeURIComponent(product.name || 'product')}`}
                className="mt-4 block w-full bg-black text-white text-center py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                View Product
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}