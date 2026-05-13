import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, Check, X, Truck, Eye, MapPin, Phone, ChevronRight } from 'lucide-react';
import { AuthContext } from '../AuthContext';

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
function ProductImage({ item, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  const dim = size === 'sm' ? 'w-12 h-12' : 'w-16 h-16';

  const base64 = hexToBase64(item?.image_data);
  const mimeType = item?.mime_type || 'image/png';

  if (base64 && !imgError) {
    return (
      <img
        src={`data:${mimeType};base64,${base64}`}
        alt={item?.product_name || 'Product'}
        className={`${dim} rounded-xl object-cover flex-shrink-0`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${dim} rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0`}>
      <Package className="text-gray-400" size={size === 'sm' ? 16 : 22} />
    </div>
  );
}

// ── Status helpers ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  delivered:  { color: 'bg-green-100 text-green-700',  icon: Check,    label: 'Delivered'  },
  shipped:    { color: 'bg-blue-100 text-blue-700',    icon: Truck,    label: 'Shipped'    },
  pending:    { color: 'bg-yellow-100 text-yellow-700',icon: Clock,    label: 'Pending'    },
  processing: { color: 'bg-purple-100 text-purple-700',icon: Package,  label: 'Processing' },
  cancelled:  { color: 'bg-red-100 text-red-700',      icon: X,        label: 'Cancelled'  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { color: 'bg-gray-100 text-gray-600', icon: Package, label: status };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { isLoggedIn, getAuthHeaders, user } = useContext(AuthContext);
  const username = user?.username || 'User';

  const safeNumber = (v) => { const n = Number(v); return isNaN(n) ? 0 : n; };

  const formatDate = (d) => {
    try {
      const date = new Date(d);
      if (isNaN(date)) return '—';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return '—'; }
  };

  useEffect(() => {
    if (isLoggedIn) fetchOrders();
    else { setLoading(false); setError('Please login to view your orders'); }
  }, [isLoggedIn]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const headers = getAuthHeaders();
      const res = await fetch('https://shopbackco.vercel.app/api/orders/', {
        headers: { ...headers, 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        const txt = await res.text();
        let msg = `Error ${res.status}`;
        try { msg = JSON.parse(txt).message || msg; } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      const ordersData = data.orders || data || [];
      const hasItems = ordersData.length > 0 && ordersData[0].items !== undefined;

      if (hasItems) {
        setOrders(ordersData.map(o => ({
          ...o,
          total_price: safeNumber(o.total_price),
          items: (o.items || []).map(item => ({
            ...item,
            price: safeNumber(item.price),
            quantity: safeNumber(item.quantity),
          }))
        })));
      } else {
        await fetchItemsSeparately(ordersData, headers);
      }
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchItemsSeparately = async (ordersData, headers) => {
    const withItems = await Promise.all(
      ordersData.map(async (order) => {
        try {
          const res = await fetch(`https://shopbackco.vercel.app/api/orders/${order.id}`, {
            headers: { ...headers, 'Content-Type': 'application/json' }
          });
          if (!res.ok) return { ...order, items: [], total_price: safeNumber(order.total_price) };
          const d = await res.json();
          const o = d.order || d;
          return {
            ...order,
            items: o.items || [],
            address: o.address || order.address,
            phone: o.phone || order.phone,
            city: o.city || order.city,
            total_price: safeNumber(o.total_price || order.total_price),
          };
        } catch {
          return { ...order, items: [], total_price: safeNumber(order.total_price) };
        }
      })
    );
    setOrders(withItems);
  };

  // ── Not logged in ──
  if (!isLoggedIn) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <X className="mx-auto text-red-400 mb-4" size={48} />
        <p className="text-gray-600 font-medium">Please login to view your orders</p>
      </div>
    </div>
  );

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Loading your orders…</p>
      </div>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <X className="mx-auto text-red-400 mb-4" size={48} />
        <p className="text-gray-700 font-medium mb-4">{error}</p>
        <button
          onClick={fetchOrders}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, <span className="font-semibold text-gray-700">{username}</span></p>
        </div>

        {/* ── Empty ── */}
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <Package className="mx-auto text-gray-300 mb-4" size={52} />
            <h3 className="text-base font-semibold text-gray-700 mb-1">No orders yet</h3>
            <p className="text-gray-400 text-sm">You haven't placed any orders.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, oi) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: oi * 0.05 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Order header */}
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {(() => { const Icon = STATUS_CONFIG[order.status]?.icon || Package; return <Icon size={16} className="text-gray-500" />; })()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Order #{order.id}</p>
                      <p className="text-xs text-gray-400">{formatDate(order.created_at || order.order_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="text-sm font-bold text-gray-900">
                      ${safeNumber(order.total_price || order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="px-5 py-4">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                  </p>

                  {order.items?.length > 0 ? (
                    <div className="space-y-2.5">
                      {order.items.slice(0, 2).map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <ProductImage item={item} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {item.product_name || item.name || `Product #${item.product_id}`}
                            </p>
                            <p className="text-xs text-gray-400">
                              Qty: {item.quantity} × ${safeNumber(item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-gray-400 pl-1">
                          +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl py-4 text-center text-xs text-gray-400">
                      No items data
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <Eye size={14} /> View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Order Details Modal ── */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 22 }}
              className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Handle bar (mobile) */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* Modal header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">Order #{selectedOrder.id}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Status + Payment */}
                <div className="flex items-center justify-between">
                  <StatusBadge status={selectedOrder.status} />
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    selectedOrder.payment_status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedOrder.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                  </span>
                </div>

                {/* Delivery address */}
                {(selectedOrder.address || selectedOrder.delivery_address || selectedOrder.shipping_address) && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <MapPin size={11} /> Delivery Address
                    </h3>
                    {(() => {
                      const addr = selectedOrder.delivery_address || selectedOrder.shipping_address;
                      if (addr) return (
                        <div className="text-sm space-y-1 text-gray-700">
                          {addr.name && <p className="font-semibold">{addr.name}</p>}
                          {addr.street && <p>{addr.street}</p>}
                          {addr.city && <p className="text-gray-500">{addr.city}{addr.state ? `, ${addr.state}` : ''}</p>}
                          {addr.phone && <p className="flex items-center gap-1 text-gray-500"><Phone size={11} />{addr.phone}</p>}
                        </div>
                      );
                      return (
                        <div className="text-sm space-y-1 text-gray-700">
                          {selectedOrder.address && <p>{selectedOrder.address}</p>}
                          {selectedOrder.city && <p className="text-gray-500">{selectedOrder.city}</p>}
                          {selectedOrder.phone && <p className="flex items-center gap-1 text-gray-500"><Phone size={11} />{selectedOrder.phone}</p>}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Items */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Items</h3>
                  {selectedOrder.items?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <ProductImage item={item} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {item.product_name || item.name || `Product #${item.product_id}`}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Qty: {item.quantity} × ${safeNumber(item.price).toFixed(2)}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                            ${(safeNumber(item.price) * safeNumber(item.quantity)).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-400 text-sm">
                      No items available
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="border-t border-gray-100 pt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>${safeNumber(selectedOrder.total_price || selectedOrder.total_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
                    <span>Total</span>
                    <span>${safeNumber(selectedOrder.total_price || selectedOrder.total_amount).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition-colors"
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