import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEye,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiX,
  FiPackage,
  FiTruck,
  FiCheck,
  FiClock,
  FiMapPin,
  FiUser,
  FiPhone,
  FiCalendar,
  FiChevronDown,
  FiAlertCircle
} from 'react-icons/fi';

// ── تحويل hex (bytea) إلى base64 ──────────────────────────────────────────────
const hexToBase64 = (hexString) => {
  if (!hexString) return null;
  try {
    const hex = hexString.startsWith('\\x') ? hexString.slice(2) : hexString;
    const binary = hex.match(/.{1,2}/g)
      .map(byte => String.fromCharCode(parseInt(byte, 16)))
      .join('');
    return btoa(binary);
  } catch (e) {
    return null;
  }
};

// ── مكون صورة المنتج ──────────────────────────────────────────────────────────
function ProductImage({ item, size = 'sm' }) {
  const [imgError, setImgError] = useState(false);
  const dim = size === 'sm' ? 'w-10 h-10' : 'w-14 h-14';

  const base64 = hexToBase64(item?.image_data);
  const mimeType = item?.mime_type || 'image/png';

  if (base64 && !imgError) {
    return (
      <img
        src={`data:${mimeType};base64,${base64}`}
        alt={item?.product_name || 'Product'}
        className={`${dim} rounded-lg object-cover flex-shrink-0`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${dim} rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0`}>
      <FiPackage className="text-gray-400" size={size === 'sm' ? 14 : 20} />
    </div>
  );
}

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

  const statusStyles = {
    pending:    { bg: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-400' },
    processing: { bg: 'bg-blue-100 text-blue-800',    dot: 'bg-blue-400'   },
    shipped:    { bg: 'bg-purple-100 text-purple-800', dot: 'bg-purple-400' },
    delivered:  { bg: 'bg-green-100 text-green-800',  dot: 'bg-green-400'  },
    cancelled:  { bg: 'bg-red-100 text-red-800',      dot: 'bg-red-400'    },
  };

  const statusIcons = {
    pending:    <FiClock    className="text-yellow-500" />,
    processing: <FiCheck    className="text-blue-500"   />,
    shipped:    <FiTruck    className="text-purple-500" />,
    delivered:  <FiPackage  className="text-green-500"  />,
    cancelled:  <FiX        className="text-red-500"    />,
  };

  useEffect(() => {
    if (userRole !== 'admin') return;
    fetchOrders();
  }, [userRole]);

  useEffect(() => {
    if (!error && !success) return;
    const t = setTimeout(() => { setError(''); setSuccess(''); }, 5000);
    return () => clearTimeout(t);
  }, [error, success]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://shopbackco.vercel.app/api/orders/', {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      const res = await fetch(`https://shopbackco.vercel.app/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Failed to update status');
      }
      setSuccess('Order status updated successfully');
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`https://shopbackco.vercel.app/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Failed to delete order');
      }
      setSuccess('Order deleted successfully');
      await fetchOrders();
      setShowDeleteModal(false);
      setOrderToDelete(null);
      if (selectedOrder?.id === orderId) {
        setShowOrderModal(false);
        setSelectedOrder(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchSearch =
      order.id?.toString().includes(searchTerm) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === '' || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Access Denied ──
  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm max-w-sm">
          <FiAlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 text-sm">Admin privileges required.</p>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading orders…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage customer orders and track fulfillment</p>
          </div>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* ── Alerts ── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
              <FiAlertCircle className="flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError('')}><FiX size={14} /></button>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
              <FiCheck className="flex-shrink-0" />
              <span className="flex-1">{success}</span>
              <button onClick={() => setSuccess('')}><FiX size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search by ID, email or username…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
            />
          </div>
          <div className="sm:w-44 relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 appearance-none bg-white"
            >
              <option value="">All Statuses</option>
              {orderStatuses.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 text-sm">
              Orders <span className="text-gray-400 font-normal ml-1">({filteredOrders.length})</span>
            </h3>
            {filteredOrders.length !== orders.length && (
              <span className="text-xs text-gray-400">Filtered from {orders.length}</span>
            )}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <FiPackage size={40} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No orders found</p>
              <p className="text-gray-400 text-sm mt-1">
                {orders.length === 0 ? "No orders yet." : "Try adjusting filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Order', 'Customer', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map(order => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">#{order.id}</td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                            {(order.username || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{order.username || 'N/A'}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[140px]">{order.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-gray-900">
                        ${order.total_price || order.total_amount}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {statusIcons[order.status]}
                          <select
                            value={order.status}
                            onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`text-xs font-semibold px-3 py-1 rounded-full border-0 outline-none cursor-pointer ${statusStyles[order.status]?.bg || 'bg-gray-100 text-gray-700'}`}
                          >
                            {orderStatuses.map(s => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <FiCalendar size={12} />
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            title="View Details"
                          >
                            <FiEye size={15} />
                          </button>
                          <button
                            onClick={() => { setOrderToDelete(order); setShowDeleteModal(true); }}
                            className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={15} />
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
      </div>

      {/* ── Delete Modal ── */}
      <AnimatePresence>
        {showDeleteModal && orderToDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="text-red-500" size={20} />
              </div>
              <h3 className="text-base font-bold text-gray-900 text-center mb-2">Delete Order #{orderToDelete.id}?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteOrder(orderToDelete.id)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {deleteLoading ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Order Details Modal ── */}
      <AnimatePresence>
        {showOrderModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <div>
                  <h2 className="font-bold text-gray-900">Order #{selectedOrder.id}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setShowOrderModal(false); setOrderToDelete(selectedOrder); setShowDeleteModal(true); }}
                    className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 size={15} />
                  </button>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Info + Delivery */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Order info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <FiPackage size={12} /> Order Info
                    </h3>
                    <div className="space-y-2.5 text-sm">
                      {[
                        ['Customer', selectedOrder.username || 'N/A'],
                        ['Email', selectedOrder.email],
                      ].map(([label, val]) => (
                        <div key={label} className="flex justify-between gap-2">
                          <span className="text-gray-500">{label}</span>
                          <span className="font-medium text-gray-900 truncate max-w-[150px]">{val}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Status</span>
                        <select
                          value={selectedOrder.status}
                          onChange={e => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${statusStyles[selectedOrder.status]?.bg || 'bg-gray-100 text-gray-700'}`}
                        >
                          {orderStatuses.map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Payment</span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          selectedOrder.payment_status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {selectedOrder.payment_status || 'unpaid'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <FiMapPin size={12} /> Delivery
                    </h3>
                    <div className="space-y-1.5 text-sm text-gray-700">
                      {(() => {
                        const addr = selectedOrder.delivery_address || selectedOrder.shipping_address;
                        if (addr) return (
                          <>
                            {addr.name && <p className="font-medium">{addr.name}</p>}
                            {addr.street && <p>{addr.street}</p>}
                            {addr.city && <p className="text-gray-500">{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zip_code || ''}</p>}
                            {addr.phone && (
                              <p className="flex items-center gap-1 text-gray-500"><FiPhone size={11} />{addr.phone}</p>
                            )}
                          </>
                        );
                        return (
                          <>
                            {selectedOrder.address && <p>{selectedOrder.address}</p>}
                            {selectedOrder.city && <p className="text-gray-500">{selectedOrder.city}</p>}
                            {selectedOrder.phone && (
                              <p className="flex items-center gap-1 text-gray-500"><FiPhone size={11} />{selectedOrder.phone}</p>
                            )}
                            {!selectedOrder.address && !selectedOrder.city && (
                              <p className="text-gray-400 text-xs">No address available</p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Order Items</h3>
                  {selectedOrder.items?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <ProductImage item={item} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{item.product_name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × ${item.price}</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-400 text-sm">No items found</div>
                  )}
                </div>

                {/* Total */}
                <div className="border-t border-gray-100 pt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>${selectedOrder.total_price || selectedOrder.total_amount}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
                    <span>Total</span>
                    <span>${selectedOrder.total_price || selectedOrder.total_amount}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowOrderModal(false)}
                  className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}