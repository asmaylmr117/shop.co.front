import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiUser, 
  FiMail, 
  FiSettings, 
  FiShoppingBag, 
  FiUsers, 
  FiPackage,
  FiStar,
  FiTrendingUp,
  FiEdit,
  FiSave,
  FiX
} from 'react-icons/fi';

export default function Profile() {
  const { userEmail, userRole, username, getAuthHeaders, logout } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get user profile
      const profileResponse = await fetch('https://shopbackco.vercel.app/api/auth/profile', {
        headers: getAuthHeaders()
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile(profileData.user);
        setNewEmail(profileData.user.email || '');
      }

      // If admin, get admin stats
      if (userRole === 'admin') {
        await fetchAdminStats();
      }

    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      console.log('Fetching admin stats...');
      
      // Initialize with empty arrays to store all data
      let allOrders = [];
      let allReviews = [];
      let allProducts = [];
      let orderStats = {};
      let reviewStats = {};

      // Get order stats from API
      const orderStatsResponse = await fetch('https://shopbackco.vercel.app/api/orders/stats/summary', {
        headers: getAuthHeaders()
      });
      
      // Get all orders as fallback
      const allOrdersResponse = await fetch('https://shopbackco.vercel.app/api/orders/', {
        headers: getAuthHeaders()
      });

      // Get review stats from API
      const reviewStatsResponse = await fetch('https://shopbackco.vercel.app/api/reviews/stats/summary', {
        headers: getAuthHeaders()
      });

      // Get all reviews as fallback
      const allReviewsResponse = await fetch('https://shopbackco.vercel.app/api/reviews/', {
        headers: getAuthHeaders()
      });

      // Get all products
      const allProductsResponse = await fetch('https://shopbackco.vercel.app/api/products', {
        headers: getAuthHeaders()
      });

      // Process order stats
      if (orderStatsResponse.ok) {
        orderStats = await orderStatsResponse.json();
        console.log('Order stats from API:', orderStats);
      } else {
        console.error('Failed to fetch order stats from API:', orderStatsResponse.status);
      }

      // Get all orders as fallback
      if (allOrdersResponse.ok) {
        const ordersData = await allOrdersResponse.json();
        allOrders = ordersData.orders || ordersData || [];
        console.log('All orders count:', allOrders.length);
      }

      // Process review stats
      if (reviewStatsResponse.ok) {
        reviewStats = await reviewStatsResponse.json();
        console.log('Review stats from API:', reviewStats);
      } else {
        console.error('Failed to fetch review stats from API:', reviewStatsResponse.status);
      }

      // Get all reviews as fallback
      if (allReviewsResponse.ok) {
        const reviewsData = await allReviewsResponse.json();
        allReviews = reviewsData.reviews || reviewsData || [];
        console.log('All reviews count:', allReviews.length);
      }
      
      // Get all products
      if (allProductsResponse.ok) {
        const productsData = await allProductsResponse.json();
        allProducts = Array.isArray(productsData) ? productsData : (productsData.products || []);
        console.log('All products count:', allProducts.length);
      }

      // Calculate final stats using API data first, then fallback to counting arrays
      setAdminStats({
        orders: {
          total: orderStats.total_orders || orderStats.totalOrders || orderStats.count || allOrders.length || 0,
          pending: orderStats.pending_orders || orderStats.pendingOrders || allOrders.filter(o => o.status === 'pending').length || 0,
          completed: orderStats.completed_orders || orderStats.completedOrders || allOrders.filter(o => o.status === 'completed').length || 0,
          cancelled: orderStats.cancelled_orders || orderStats.cancelledOrders || allOrders.filter(o => o.status === 'cancelled').length || 0
        },
        reviews: {
          total: reviewStats.total_reviews || reviewStats.totalReviews || reviewStats.count || allReviews.length || 0,
          average_rating: reviewStats.average_rating || reviewStats.averageRating || reviewStats.avgRating || 0,
          approved: reviewStats.approved_reviews || allReviews.filter(r => r.status === 'approved').length || 0,
          pending: reviewStats.pending_reviews || allReviews.filter(r => r.status === 'pending').length || 0
        },
        products: {
          total: allProducts.length || 0
        }
      });

      console.log('Final admin stats calculated:', {
        orders: {
          total: orderStats.total_orders || orderStats.totalOrders || allOrders.length || 0
        },
        reviews: {
          total: reviewStats.total_reviews || reviewStats.totalReviews || allReviews.length || 0,
          average_rating: reviewStats.average_rating || reviewStats.averageRating || 0
        },
        products: {
          total: allProducts.length || 0
        }
      });

    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
      setError('Failed to load admin statistics');
    }
  };

  const handleUpdateEmail = async () => {
    try {
      const response = await fetch('https://shopbackco.vercel.app/api/auth/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: newEmail })
      });

      if (response.ok) {
        setUserProfile(prev => ({ ...prev, email: newEmail }));
        setEditingEmail(false);
        setError('');
      } else {
        throw new Error('Failed to update email');
      }
    } catch (err) {
      setError('Failed to update email');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRating = (rating) => {
    return rating ? parseFloat(rating).toFixed(1) : '0.0';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <FiUser className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome, {username || userEmail}
                  </h1>
                  <p className="text-sm text-gray-500 capitalize">
                    {userRole} Account
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-4">
              {['profile', ...(userRole === 'admin' ? ['dashboard'] : [])].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow rounded-lg p-6"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-sm text-gray-900">{userProfile?.username || username}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                {editingEmail ? (
                  <div className="mt-1 flex space-x-2">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <button
                      onClick={handleUpdateEmail}
                      className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700"
                    >
                      <FiSave />
                    </button>
                    <button
                      onClick={() => setEditingEmail(false)}
                      className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700"
                    >
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-sm text-gray-900">{userProfile?.email || userEmail}</p>
                    <button
                      onClick={() => setEditingEmail(true)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FiEdit />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Account Type</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{userRole}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                <p className="mt-1 text-sm text-gray-900">
                  {userProfile?.created_at ? formatDate(userProfile.created_at) : 'N/A'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Admin Dashboard */}
        {activeTab === 'dashboard' && userRole === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Dashboard</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FiShoppingBag className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Total Orders</p>
                      <p className="text-2xl font-semibold text-blue-900">
                        {adminStats?.orders?.total || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FiPackage className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Total Products</p>
                      <p className="text-2xl font-semibold text-green-900">
                        {adminStats?.products?.total || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FiStar className="h-8 w-8 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-600">Total Reviews</p>
                      <p className="text-2xl font-semibold text-yellow-900">
                        {adminStats?.reviews?.total || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FiUsers className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Avg Rating</p>
                      <p className="text-2xl font-semibold text-purple-900">
                        {formatRating(adminStats?.reviews?.average_rating)}⭐
                      </p>
                    </div>
                  </div>
                </div>
              </div>

             

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/AdminProducts"
                  className="bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700 text-center transition-colors"
                >
                  <FiPackage className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-medium">Manage Products</div>
                  <div className="text-sm opacity-90">
                    {adminStats?.products?.total || 0} products
                  </div>
                </Link>
                
                <Link
                  to="/AdminOrders"
                  className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 text-center transition-colors"
                >
                  <FiShoppingBag className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-medium">Manage Orders</div>
                  <div className="text-sm opacity-90">
                    {adminStats?.orders?.total || 0} orders
                  </div>
                </Link>
                
                <Link
                  to="/AdminReviews"
                  className="bg-yellow-600 text-white p-4 rounded-lg hover:bg-yellow-700 text-center transition-colors"
                >
                  <FiStar className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-medium">Manage Reviews</div>
                  <div className="text-sm opacity-90">
                    {adminStats?.reviews?.total || 0} reviews
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}