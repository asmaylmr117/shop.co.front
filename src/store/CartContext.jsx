import { createContext, useEffect, useState, useCallback } from "react";

export const CartCtx = createContext({
  Cart: 0,
  setCart: () => {},
  Cost: 0,
  setCost: () => {},
  cartItems: [],
  updateCart: () => {},
  getTotalQuantity: () => 0,
  isLoading: false
});

export default function CartContext({children}) {
  const [cartItems, setCartItems] = useState([]);
  const [Cart, setCart] = useState(0);
  const [Cost, setCost] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // دالة آمنة لقراءة localStorage
  const getCartFromStorage = useCallback(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      console.log('🔍 Raw localStorage data:', storedCart);
      
      const parsedCart = storedCart ? JSON.parse(storedCart) : [];
      console.log('📦 Parsed cart data:', parsedCart);
      
      const validCart = Array.isArray(parsedCart) ? parsedCart : [];
      console.log('✅ Valid cart array:', validCart);
      
      return validCart;
    } catch (error) {
      console.error('❌ Error reading cart from localStorage:', error);
      return [];
    }
  }, []);

  // دالة لحساب البيانات من cartItems
  const calculateCartData = useCallback((items) => {
    console.log('🧮 Calculating cart data for items:', items);
    
    const count = items.length;
    const totalQuantity = items.reduce((total, item) => {
      const quantity = parseInt(item.Quantity) || 1;
      return total + quantity;
    }, 0);
    
    const cost = items.reduce((total, item) => {
      const itemCost = (parseFloat(item.cost || item.price) || 0) * (parseInt(item.Quantity) || 1);
      return total + itemCost;
    }, 0);
    
    const result = { count, cost, totalQuantity };
    console.log('📊 Calculated result:', result);
    
    return result;
  }, []);

  // دالة للحصول على إجمالي الكمية
  const getTotalQuantity = useCallback(() => {
    return cartItems.reduce((total, item) => {
      return total + (parseInt(item.Quantity) || 1);
    }, 0);
  }, [cartItems]);

  // دالة تحديث السلة
  const updateCart = useCallback(() => {
    console.log('🔄 Manual cart update triggered');
    setIsLoading(true);
    
    const newCartItems = getCartFromStorage();
    console.log('📱 New cart items from storage:', newCartItems);
    
    setCartItems(newCartItems);
    
    // حساب البيانات الجديدة
    const { count, cost } = calculateCartData(newCartItems);
    setCart(count);
    setCost(cost);
    
    setIsLoading(false);
    console.log('✅ Cart update completed');
  }, [getCartFromStorage, calculateCartData]);

  // تهيئة السلة عند التحميل
  useEffect(() => {
    console.log('🚀 CartContext initializing...');
    updateCart();
  }, [updateCart]);

  // تحديث Cart و Cost عند تغيير cartItems
  useEffect(() => {
    console.log('📢 cartItems changed:', cartItems);
    
    if (cartItems.length === 0 && isLoading) {
      console.log('⏳ Still loading, skipping calculation');
      return;
    }
    
    const { count, cost } = calculateCartData(cartItems);
    console.log('📊 Updating cart state:', { count, cost });
    
    setCart(count);
    setCost(cost);
  }, [cartItems, calculateCartData, isLoading]);

  // مراقبة تغييرات localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'cart') {
        console.log('💾 Storage change detected for cart');
        updateCart();
      }
    };

    const handleCartUpdate = () => {
      console.log('🔔 Custom cart update event triggered');
      updateCart();
    };

    // إضافة مستمعين للأحداث
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);

    // تنظيف المستمعين عند الإلغاء
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [updateCart]);

  const contextValue = {
    Cart,
    setCart,
    Cost,
    setCost,
    cartItems,
    updateCart,
    getTotalQuantity,
    isLoading
  };

  console.log('🎯 CartContext rendering with:', {
    cartItemsLength: cartItems.length,
    Cart,
    Cost,
    isLoading,
    cartItems: cartItems.slice(0, 2) // عرض أول عنصرين فقط للتشخيص
  });

  return (
    <CartCtx.Provider value={contextValue}>
      {children}
    </CartCtx.Provider>
  );
}