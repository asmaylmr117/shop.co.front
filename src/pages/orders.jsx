import { useState, useEffect, useContext } from 'react';
import { Package, Clock, Check, X, Truck, Eye } from 'lucide-react';
import { AuthContext } from '../AuthContext';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const { isLoggedIn, getAuthHeaders, user } = useContext(AuthContext);
  const username = user?.username || "User";

  // Helper function to safely convert to number
  const safeNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Fetch orders from API
  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
    } else {
      setLoading(false);
      setError('Please login to view your orders');
    }
  }, [isLoggedIn]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Fetching orders...');
      const headers = getAuthHeaders();
      console.log('Auth headers:', headers);

      const response = await fetch('https://shopbackco.vercel.app/api/orders/', {
        method: 'GET',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });

      console.log('Orders response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch orders:', response.status, errorText);
        
        // Try to parse error as JSON
        let errorMessage = `Failed to fetch orders: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          console.warn('Could not parse error response as JSON');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Orders data received:', data);

      // Access orders correctly - the optimized backend should include items
      const ordersData = data.orders || data || [];
      console.log('Orders array:', ordersData);

      // Check if orders already have items (optimized backend working)
      const hasItemsInFirstOrder = ordersData.length > 0 && ordersData[0].items !== undefined;
      console.log('Orders have items included:', hasItemsInFirstOrder);

      if (hasItemsInFirstOrder) {
        // Orders already include items (optimized backend is working)
        const processedOrders = ordersData.map(order => ({
          ...order,
          total_price: safeNumber(order.total_price),
          items: (order.items || []).map(item => ({
            ...item,
            price: safeNumber(item.price),
            quantity: safeNumber(item.quantity),
            subtotal: safeNumber(item.subtotal)
          }))
        }));
        
        console.log('Using optimized data with items:', processedOrders);
        setOrders(processedOrders);
      } else {
        // Fallback: fetch items separately (if optimized backend failed)
        console.log('Orders do not include items, fetching separately...');
        await fetchOrdersWithItemsSeparately(ordersData, headers);
      }

    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Fallback method: fetch items separately for each order
  const fetchOrdersWithItemsSeparately = async (ordersData, headers) => {
    try {
      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          try {
            console.log(`Fetching details for order ${order.id}`);
            const detailResponse = await fetch(`https://shopbackco.vercel.app/api/orders/${order.id}`, {
              headers: {
                ...headers,
                'Content-Type': 'application/json'
              }
            });

            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              console.log(`Order ${order.id} details:`, detailData);
              
              // Access the order data correctly
              const orderWithItems = detailData.order || detailData;
              
              return {
                ...order,
                items: orderWithItems.items || [],
                address: orderWithItems.address || order.address,
                phone: orderWithItems.phone || order.phone,
                city: orderWithItems.city || order.city,
                total_price: safeNumber(orderWithItems.total_price || order.total_price),
                total_amount: safeNumber(orderWithItems.total_amount || order.total_amount)
              };
            } else {
              console.warn(`Failed to fetch details for order ${order.id}: ${detailResponse.status}`);
              return {
                ...order,
                items: [],
                total_price: safeNumber(order.total_price),
                total_amount: safeNumber(order.total_amount)
              };
            }
          } catch (err) {
            console.error(`Error fetching details for order ${order.id}:`, err);
            return {
              ...order,
              items: [],
              total_price: safeNumber(order.total_price),
              total_amount: safeNumber(order.total_amount)
            };
          }
        })
      );

      console.log('Orders with separately fetched details:', ordersWithDetails);
      setOrders(ordersWithDetails);
    } catch (err) {
      console.error('Error in fallback method:', err);
      // If fallback fails, at least show orders without items
      const processedOrders = ordersData.map(order => ({
        ...order,
        total_price: safeNumber(order.total_price),
        items: []
      }));
      setOrders(processedOrders);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'shipped':
        return 'Shipped';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Enhanced image rendering with support for different image types
  const renderProductImage = (item) => {
    // First try to render base64 image data
    if (item.image_data) {
      return (
        <div className="relative">
          <img
            src={`data:image/jpeg;base64,${item.image_data}`}
            alt={item.product_name || item.name || 'Product'}
            className="w-16 h-16 object-cover rounded-lg"
            onError={(e) => {
              console.warn(`Failed to load base64 image for item:`, item.product_name);
              e.target.style.display = 'none';
              const fallback = e.target.nextElementSibling;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div 
            className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center absolute top-0 left-0" 
            style={{display: 'none'}}
          >
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      );
    } 
    // Then try regular image URL
    else if (item.image_url) {
      return (
        <div className="relative">
          <img
            src={item.image_url}
            alt={item.product_name || item.name || 'Product'}
            className="w-16 h-16 object-cover rounded-lg"
            onError={(e) => {
              console.warn(`Failed to load image URL for item:`, item.product_name);
              e.target.style.display = 'none';
              const fallback = e.target.nextElementSibling;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div 
            className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center absolute top-0 left-0" 
            style={{display: 'none'}}
          >
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      );
    }
    // Check if there's an image_id (maybe for future reference)
    else if (item.image_id) {
      // Could potentially construct URL based on image_id, but for now show placeholder
      return (
        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
          <Package className="h-8 w-8 text-blue-500" />
          <span className="text-xs text-blue-600 ml-1">{item.image_id}</span>
        </div>
      );
    }
    // Default placeholder
    return (
      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
        <Package className="h-8 w-8 text-gray-400" />
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg">Please login to view your orders</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Welcome {username}, track your order status here</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600">You haven't placed any orders yet</p>
            <button className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.created_at || order.order_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        ${safeNumber(order.total_price || order.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Summary with Images */}
                  <div className="border-t pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">
                          {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                        </p>

                        {/* Display product images and names */}
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-2">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={item.id || index} className="flex items-center space-x-3">
                                {renderProductImage(item)}
                                <div>
                                  <p className="text-sm font-medium text-gray-800">
                                    {item.product_name || item.name || `Product #${item.product_id}` || 'Unknown Product'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Qty: {item.quantity || 0} × ${safeNumber(item.price).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-sm text-gray-500 ml-19">
                                +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-gray-50 rounded-lg">
                            <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Loading items...</p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleViewDetails(order)}
                        className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition-colors ml-4"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Details #{selectedOrder.id}
                </h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span className="font-medium">
                        {formatDate(selectedOrder.created_at || selectedOrder.order_date)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Status:</span>
                      <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`px-2 py-1 rounded-full text-sm ${selectedOrder.payment_status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {selectedOrder.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Address</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      {selectedOrder.address || 'No address provided'}
                    </p>
                    {selectedOrder.city && (
                      <p className="text-gray-600">City: {selectedOrder.city}</p>
                    )}
                    {selectedOrder.phone && (
                      <p className="text-gray-600">Phone: {selectedOrder.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div key={item.id || index} className="flex items-center space-x-4 py-3 border-b">
                        {renderProductImage(item)}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.product_name || item.name || `Product #${item.product_id}` || 'Unknown Product'}
                          </h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity || 0}</p>
                          <p className="text-sm text-gray-600">Unit Price: ${safeNumber(item.price).toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ${(safeNumber(item.price) * safeNumber(item.quantity)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No items information available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    ${safeNumber(selectedOrder.total_price || selectedOrder.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}