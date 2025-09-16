export default function AddToCart(arr, setCart, setCost, num = 0, type = 'add') {
  console.log('AddToCart called with:', { arr, num, type });

  if (type === 'empty') {
    localStorage.setItem('cart', JSON.stringify([]));
    setCart(0);
    setCost(0);
    window.dispatchEvent(new Event('cartUpdated'));
    console.log('Cart emptied');
    return [];
  }

  // التحقق من صحة البيانات المُدخلة
  if (!arr || !arr.id) {
    console.error('Invalid product data:', arr);
    return;
  }

  // قراءة السلة الحالية
  let cart = [];
  try {
    const storedCart = localStorage.getItem('cart');
    cart = storedCart ? JSON.parse(storedCart) : [];
    if (!Array.isArray(cart)) cart = [];
  } catch (error) {
    console.error('Error reading cart:', error);
    cart = [];
  }

  // البحث عن المنتج في السلة
  const index = cart.findIndex(item => 
    item.id === arr.id && 
    (item.color || '') === (arr.color || '') && 
    (item.size || '') === (arr.size || '')
  );

  const quantityToAdd = num === 0 ? (arr.Quantity || 1) : num;

  if (index !== -1) {
    // المنتج موجود - تحديث الكمية
    cart[index].Quantity = (cart[index].Quantity || 1) + quantityToAdd;
    
    if (cart[index].Quantity <= 0) {
      cart.splice(index, 1);
    }
    console.log('Updated existing product in cart');
  } else {
    // منتج جديد - إضافة للسلة
    const productToAdd = {
      ...arr,
      Quantity: quantityToAdd > 0 ? quantityToAdd : 1
    };
    cart.push(productToAdd);
    console.log('Added new product to cart');
  }

  // حفظ في localStorage
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Cart saved to localStorage:', cart);
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }

  // حساب البيانات الجديدة
  const newCount = cart.length;
  const newCost = cart.reduce((total, item) => {
    const itemCost = (parseFloat(item.cost) || 0) * (parseInt(item.Quantity) || 1);
    return total + itemCost;
  }, 0);

  // تحديث الحالة
  setCart(newCount);
  setCost(newCost);

  // إرسال إشعار التحديث
  window.dispatchEvent(new Event('cartUpdated'));
  
  console.log('Cart updated:', { count: newCount, cost: newCost });
  return cart;
}