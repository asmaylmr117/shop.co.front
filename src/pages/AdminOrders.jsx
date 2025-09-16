import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiEye, 
  FiEdit, 
  FiTrash2, 
  FiSearch, 
  FiFilter,
  FiSave,
  FiX,
  FiPackage,
  FiTruck,
  FiCheck,
  FiClock,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiChevronDown,
  FiAlertCircle
} from 'react-icons/fi';

export default function AdminOrders() {
  const { getAuthHeaders, userRole } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    pending: <FiClock className="text-yellow-600" />,
    processing: <FiCheck className="text-blue-600" />,
    shipped: <FiTruck className="text-purple-600" />,
    delivered: <FiPackage className="text-green-600" />,
    cancelled: <FiX className="text-red-600" />
  };

  useEffect(() => {
    if (userRole !== 'admin') {
      setError('Access denied. Admin privileges required.');
      return;
    }
    fetchOrders();
  }, [userRole]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('https://shopbackco.vercel.app/api/orders/', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (err) {
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Clear messages after a delay
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Update order status with correct endpoint and proper JSON formatting
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`https://shopbackco.vercel.app/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setSuccess('Order status updated successfully');
        await fetchOrders();
        // Update selected order if it's currently being viewed
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({...selectedOrder, status: newStatus});
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete order function
  const handleDeleteOrder = async (orderId) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`https://shopbackco.vercel.app/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setSuccess('Order deleted successfully');
        await fetchOrders();
        setShowDeleteModal(false);
        setOrderToDelete(null);
        
        // Close order modal if the deleted order was being viewed
        if (selectedOrder && selectedOrder.id === orderId) {
          setShowOrderModal(false);
          setSelectedOrder(null);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete order');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open delete confirmation modal
  const confirmDeleteOrder = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id?.toString().includes(searchTerm) ||
                         order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <FiAlertCircle className="mx-auto text-red-500 text-5xl mb-4" />
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">Admin privileges required to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-600 mt-1">Manage customer orders and track fulfillment</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button 
                onClick={fetchOrders}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
              >
                {loading ? 'Refreshing...' : 'Refresh Orders'}
              </button>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        <div className="space-y-4 mb-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <FiX />
              </button>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-start">
              <FiCheck className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="ml-auto">
                <FiX />
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by ID, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  <option value="">All Statuses</option>
                  {orderStatuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Orders ({filteredOrders.length})</h3>
            {filteredOrders.length > 0 && (
              <span className="text-sm text-gray-500">
                Showing {filteredOrders.length} of {orders.length} orders
              </span>
            )}
          </div>
          
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <FiPackage className="mx-auto text-gray-400 text-4xl mb-4" />
              <p className="text-gray-500 text-lg">No orders found</p>
              <p className="text-gray-400 mt-1">
                {orders.length === 0 
                  ? "You don't have any orders yet." 
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FiUser className="text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {order.username || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-medium">${order.total_price || order.total_amount}</span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">
                            {statusIcons[order.status]}
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}
                          >
                            {orderStatuses.map(status => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <FiCalendar className="text-gray-400" />
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50"
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => confirmDeleteOrder(order)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
                            title="Delete Order"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && orderToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <FiAlertCircle className="w-6 h-6 text-red-600" />
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                  Delete Order
                </h3>
                
                <p className="text-sm text-gray-500 text-center mb-6">
                  Are you sure you want to delete order #{orderToDelete.id}? 
                  This action cannot be undone and will permanently remove all order data.
                </p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(orderToDelete.id)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order Details Modal - Updated for responsiveness */}
        <AnimatePresence>
          {showOrderModal && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowOrderModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg w-full max-w-lg md:max-w-2xl lg:max-w-3xl mx-2 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 md:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Order #{selectedOrder.id}</h2>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => confirmDeleteOrder(selectedOrder)}
                        className="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                        title="Delete Order"
                      >
                        <FiTrash2 size={16} />
                      </button>
                      <button
                        onClick={() => setShowOrderModal(false)}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Order Information */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                        <FiPackage className="mr-2 text-sm" /> Order Info
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Customer:</span>
                          <span className="font-medium">{selectedOrder.username || 'N/A'}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium truncate ml-2 max-w-[120px] md:max-w-[150px]">{selectedOrder.email}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium text-xs md:text-sm">
                            {new Date(selectedOrder.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Status:</span>
                          <select
                            value={selectedOrder.status}
                            onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                            className={`text-xs px-2 py-1 font-semibold rounded-full border-0 focus:ring-1 focus:ring-indigo-500 focus:outline-none ${statusColors[selectedOrder.status] || 'bg-gray-100 text-gray-800'}`}
                          >
                            {orderStatuses.map(status => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Payment:</span>
                          <span className="text-xs px-2 py-1 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {selectedOrder.payment_status || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                        <FiMapPin className="mr-2 text-sm" /> Delivery
                      </h3>
                      <div className="space-y-1 text-sm">
                        {selectedOrder.delivery_address ? (
                          <>
                            {selectedOrder.delivery_address.name && (
                              <div className="flex items-start">
                                <FiUser className="text-gray-400 mt-0.5 mr-1 flex-shrink-0 text-xs" />
                                <span className="font-medium truncate">{selectedOrder.delivery_address.name}</span>
                              </div>
                            )}
                            {selectedOrder.delivery_address.street && (
                              <div className="truncate">
                                <span className="font-medium">{selectedOrder.delivery_address.street}</span>
                              </div>
                            )}
                            {selectedOrder.delivery_address.city && selectedOrder.delivery_address.state && (
                              <div>
                                <span className="text-gray-600 text-xs">
                                  {selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state} {selectedOrder.delivery_address.zip_code}
                                </span>
                              </div>
                            )}
                            {selectedOrder.delivery_address.phone && (
                              <div className="flex items-center">
                                <FiPhone className="text-gray-400 mr-1 text-xs" />
                                <span className="font-medium text-xs">{selectedOrder.delivery_address.phone}</span>
                              </div>
                            )}
                          </>
                        ) : selectedOrder.shipping_address ? (
                          <>
                            <div className="truncate">
                              <span className="font-medium">{selectedOrder.shipping_address.street}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 text-xs">
                                {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}
                              </span>
                            </div>
                            {selectedOrder.shipping_address.phone && (
                              <div className="flex items-center">
                                <FiPhone className="text-gray-400 mr-1 text-xs" />
                                <span className="font-medium text-xs">{selectedOrder.shipping_address.phone}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          // Fallback to old format
                          <>
                            {selectedOrder.address && (
                              <div className="truncate">
                                <span className="font-medium">{selectedOrder.address}</span>
                              </div>
                            )}
                            {selectedOrder.city && (
                              <div>
                                <span className="text-gray-600 text-xs">{selectedOrder.city}</span>
                              </div>
                            )}
                            {selectedOrder.phone && (
                              <div className="flex items-center">
                                <FiPhone className="text-gray-400 mr-1 text-xs" />
                                <span className="font-medium text-xs">{selectedOrder.phone}</span>
                              </div>
                            )}
                            {!selectedOrder.address && !selectedOrder.city && !selectedOrder.phone && (
                              <div className="text-gray-500 text-xs">No delivery address available</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items Section */}
                  <div className="mt-6">
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Order Items</h3>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      <div className="space-y-2">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                <FiPackage className="text-blue-600 text-xs" />
                              </div>
                              <div className="max-w-[160px] md:max-w-xs">
                                <h4 className="font-medium text-gray-900 text-sm truncate">{item.product_name}</h4>
                                <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.price}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg text-sm">
                        No items found for this order
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-end">
                      <div className="text-right space-y-1 text-sm">
                        <p>
                          <span className="text-gray-600">Subtotal: </span>
                          <span className="font-medium">${selectedOrder.total_price || selectedOrder.total_amount}</span>
                        </p>
                        <p>
                          <span className="text-gray-600">Shipping: </span>
                          <span className="font-medium">$0.00</span>
                        </p>
                        <p className="text-lg font-bold">
                          <span className="text-gray-800">Total: </span>
                          <span className="text-blue-600">${selectedOrder.total_price || selectedOrder.total_amount}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setShowOrderModal(false)}
                      className="px-4 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}