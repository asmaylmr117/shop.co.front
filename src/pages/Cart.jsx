import { useContext, useState, useRef, useEffect } from "react"
import CartLayout from "../components/CartLayout"
import { Link } from "react-router-dom"
import { CartCtx } from "../store/CartContext"
import { AuthContext } from "../AuthContext"
import Reavel from "../Reavel"
import { MdOutlineDiscount } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import AddToCart from "../store/AddToCart"
import { IoIosArrowForward } from "react-icons/io";
import Img from "../components/Img"

export default function Cart() {
  const { cartItems, updateCart, Cost, setCost, setCart, isLoading } = useContext(CartCtx)
  const { isLoggedIn, getAuthHeaders } = useContext(AuthContext)
  const [Discount, setDiscount] = useState(0)
  const [CorrectDiscount, setCorrectDiscount] = useState('Yet')
  const [Checkout, setCheckout] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    address: '',
    phone: '',
    city: '',
    is_default: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const DiscountRef = useRef()

  useEffect(() => {
    window.scrollTo(0, 0)
    
    setTimeout(() => {
      updateCart()
    }, 100)
  }, [updateCart])

  useEffect(() => {
    if (isLoggedIn) {
      fetchAddresses()
    }
  }, [isLoggedIn])

  
  useEffect(() => {
    console.log('Cart Component Debug:', {
      cartItems,
      cartItemsLength: cartItems?.length,
      Cost,
      isLoading,
      localStorage: localStorage.getItem('cart')
    });
  }, [cartItems, Cost, isLoading]);

  const fetchAddresses = async () => {
    try {
      console.log('Fetching addresses...');
      const headers = getAuthHeaders();
      console.log('Auth headers:', headers);

      const response = await fetch('https://shopbackco.vercel.app/api/orders/addresses', {
        method: 'GET',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Fetch addresses response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Addresses data:', data);
        setAddresses(data.addresses || []);
        const defaultAddr = data.addresses?.find(addr => addr.is_default);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr.id);
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch addresses:', response.status, errorText);
        setError(`Failed to fetch addresses: ${response.status} ${errorText}`);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
      setError('Failed to fetch addresses: ' + err.message);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear previous errors
    
    // Validate input data
    if (!newAddress.address.trim() || !newAddress.phone.trim() || !newAddress.city.trim()) {
      setError('Address, phone, and city are required');
      setLoading(false);
      return;
    }

    try {
      console.log('Adding address...', newAddress);
      const headers = getAuthHeaders();
      console.log('Auth headers for add address:', headers);

      const response = await fetch('https://shopbackco.vercel.app/api/orders/addresses', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: newAddress.address.trim(),
          phone: newAddress.phone.trim(),
          city: newAddress.city.trim(),
          is_default: newAddress.is_default
        })
      });

      console.log('Add address response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Address added successfully:', data);
        await fetchAddresses(); // Refresh addresses list
        setNewAddress({ address: '', phone: '', city: '', is_default: false });
        setShowAddressForm(false);
        setError('');
      } else {
        const errorData = await response.text();
        console.error('Failed to add address:', response.status, errorData);
        let errorMessage;
        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.message || `HTTP ${response.status}`;
        } catch {
          errorMessage = `HTTP ${response.status}: ${errorData}`;
        }
        setError('Failed to add address: ' + errorMessage);
      }
    } catch (err) {
      console.error('Network error adding address:', err);
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoCode = (e) => {
    e.preventDefault();
    const code = DiscountRef.current?.value?.trim();
    
    if (code === 'Moemen') {
      setDiscount(20)
      setCorrectDiscount(true)
    } else if (code === 'MeMo') {
      setDiscount(100)
      setCorrectDiscount(true)
    } else if (code === '') {
      setDiscount(0)
      setCorrectDiscount('Yet')
    } else {
      setDiscount(0)
      setCorrectDiscount(false)
    }
  }

  const clearCart = () => {
    localStorage.setItem('cart', JSON.stringify([]));
    setCart(0);
    setCost(0);
    window.dispatchEvent(new Event('cartUpdated'));
    updateCart();
    console.log('Cart cleared successfully');
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      setError('Please login to place an order');
      return;
    }

    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setError('');
    setLoading(true);

    try {
      console.log('Processing checkout...');
      const items = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.Quantity || 1
      }));

      console.log('Checkout data:', {
        address_id: selectedAddress,
        items: items
      });

      const headers = getAuthHeaders();
      console.log('Checkout headers:', headers);

      const response = await fetch('https://shopbackco.vercel.app/api/orders/', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address_id: parseInt(selectedAddress),
          items: items
        })
      });

      console.log('Checkout response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Order created successfully:', data);
        clearCart();
        setCheckout(true);
      } else {
        const errorData = await response.text();
        console.error('Checkout failed:', response.status, errorData);
        let errorMessage;
        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.message || `HTTP ${response.status}`;
        } catch {
          errorMessage = `HTTP ${response.status}: ${errorData}`;
        }
        setError('Checkout failed: ' + errorMessage);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    const subtotal = Cost || 0;
    const discountAmount = subtotal * Discount / 100;
    const deliveryFee = subtotal > 0 ? 15 : 0;
    return subtotal - discountAmount + deliveryFee;
  };

  // Debug: Check if user is logged in and has valid token
  useEffect(() => {
    console.log('Auth status:', {
      isLoggedIn,
      authHeaders: getAuthHeaders()
    });
  }, [isLoggedIn, getAuthHeaders]);

  if (Checkout) {
    return (
      <div className="mainMargin flex-col-reverse lg:flex-row flex items-center">
        <div className="text-center flex flex-col items-center gap-5">
          <Reavel>
            <h1 className="font-bold text-4xl sm:text-5xl">Thank You for Your Purchase!</h1>
          </Reavel>
          <Reavel>
            <p className="text-lg sm:text-xl">
              Your order has been placed successfully. You will receive a confirmation email shortly.
            </p>
          </Reavel>
          <Link className="btn w-full sm:w-auto md:w-fit text-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all whitespace-nowrap" to='/Shop'>
            Continue Shopping
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 75 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'just' }}
          className="flex-grow relative w-full nav:w-fit">
          <img src="order_confirmed.gif" alt="Order Confirmed" />
        </motion.div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="mainMargin">
        <div className='flex my-5 items-center gap-4'>
          <Link to='/' className='text-gray-400 hover:text-gray-600'>Home</Link>
          <IoIosArrowForward color='gray' />
          <p>Cart</p>
        </div>
        <h1 className="bolded text-3xl xsm:text-4xl">Your Cart</h1>
        
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  // Empty cart state
  if (!cartItems || cartItems.length === 0 || (!Cost && cartItems.length === 0)) {
    return (
      <div className="mainMargin flex-col-reverse lg:flex-row flex items-center">
        <div className="text-center flex flex-col items-center gap-5">
          <Reavel><h1 className="bolded text-4xl xsm:text-5xl">Your Cart is Empty!</h1></Reavel>
          <Reavel><p>Must add items to the cart before you proceed to checkout</p></Reavel>
          <Reavel>
            <Link className="btn w-full sm:w-auto md:w-fit text-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all whitespace-nowrap"
              to='/Shop'>
              Go to Shop
            </Link>
          </Reavel>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 75 }}
          animate={{ opacity: 1, y: 0 }} 
          transition={{ type: 'just' }}
          className="flex-grow relative w-full nav:w-fit">
          <img src="undraw_shopping_app_flsj.png" alt="Empty Cart" /> 
        </motion.div>
      </div>
    )
  }

  return (
    <div className="">
      <div className='flex my-5 items-center gap-4 ml-5'>
        <Link to='/' className='text-gray-400 hover:text-gray-600'>Home</Link>
        <IoIosArrowForward color='gray' />
        <p>Cart</p>
      </div>
      <h1 className="bolded text-3xl xsm:text-4xl ml-5">Your Cart</h1>

      {error && (
        <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-5">
        <motion.div key={cartItems.length} className="flex flex-grow-huge h-fit flex-col rounded-xl border-2 p-5">
          <AnimatePresence>
            {cartItems.map((item, index) => (
              <motion.div
                key={`${item.id}-${item.color || ''}-${item.size || ''}`}
                initial={{ height: 'auto', opacity: 0, y: 0 }}
                animate={{ height: 'auto', opacity: 1, y: 10 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                transition={{ type: 'just', delay: 0.1 * index }}
              >
                <CartLayout updateCart={updateCart} setCost={setCost} item={item} />
                {index + 1 !== cartItems.length && <hr className="my-5" />}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl border-2 flex-grow sm:min-w-[450px] h-fit">
          <h1 className="mb-5 font-bold text-xl">Order Summary</h1>
          
          {/* Address Selection */}
          {isLoggedIn && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-3">Delivery Address</h3>
              {addresses.length > 0 ? (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <label key={addr.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={(e) => setSelectedAddress(parseInt(e.target.value))}
                        className="form-radio"
                      />
                      <span className="text-sm">
                        {addr.address}, {addr.city} - {addr.phone}
                        {addr.is_default && <span className="text-green-600 ml-2">(Default)</span>}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-2">No addresses found</p>
              )}
              
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-indigo-600 hover:text-indigo-800 text-sm mt-2"
              >
                + Add New Address
              </button>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="mt-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Address"
                    value={newAddress.address}
                    onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    minLength={3}
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    minLength={2}
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    minLength={10}
                  />
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAddress.is_default}
                      onChange={(e) => setNewAddress({...newAddress, is_default: e.target.checked})}
                    />
                    <span className="text-sm">Set as default address</span>
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Adding...' : 'Add Address'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setNewAddress({ address: '', phone: '', city: '', is_default: false });
                        setError(''); // Clear errors when cancelling
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <div>Subtotal</div>
              <div className="text-lg font-bold">${Cost.toFixed(2)}</div>
            </div>
            {Discount > 0 && (
              <div className="flex justify-between">
                <div>Discount (-{Discount}%)</div>
                <div className="text-lg font-bold text-red-600">-${(Cost * Discount / 100).toFixed(2)}</div>
              </div>
            )}
            <div className="flex justify-between">
              <div>Delivery Fee</div>
              <div className="text-lg font-bold">$15.00</div>
            </div>
            <hr />
            <div className="flex justify-between">
              <div className="font-bold">Total</div>
              <div className="text-xl font-bold text-green-600">${calculateTotalPrice().toFixed(2)}</div>
            </div>
            
            
            
            <div className="flex mt-5 mb-5">
              {isLoggedIn ? (
                <button 
                  onClick={handleCheckout}
                  disabled={loading || !selectedAddress || cartItems.length === 0}
                  className={`btn flex-grow text-center transition-colors ${
                    loading || !selectedAddress || cartItems.length === 0
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'hover:bg-gray-600'
                  }`}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              ) : (
                <Link 
                  to="/login" 
                  className="btn flex-grow text-center hover:bg-gray-600 transition-colors"
                >
                  Login to Checkout
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}