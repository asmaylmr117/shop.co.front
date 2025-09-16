import { useState } from 'react';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import AddToCart from '../store/AddToCart';

export default function CartLayout({ item, updateCart, setCost }) {
  const [quantity, setQuantity] = useState(item.Quantity || 1);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem();
      return;
    }

    // تحديث localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(cartItem => 
      cartItem.id === item.id && 
      (cartItem.color || '') === (item.color || '') && 
      (cartItem.size || '') === (item.size || '')
    );

    if (itemIndex !== -1) {
      cart[itemIndex].Quantity = newQuantity;
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // حساب التكلفة الجديدة
      const newCost = cart.reduce((total, cartItem) => {
        return total + (parseFloat(cartItem.cost) || 0) * (parseInt(cartItem.Quantity) || 1);
      }, 0);
      
      setCost(newCost);
      setQuantity(newQuantity);
      updateCart(); // تحديث السياق
    }
  };

  const handleRemoveItem = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.filter(cartItem => 
      !(cartItem.id === item.id && 
        (cartItem.color || '') === (item.color || '') && 
        (cartItem.size || '') === (item.size || ''))
    );
    
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // حساب التكلفة الجديدة
    const newCost = updatedCart.reduce((total, cartItem) => {
      return total + (parseFloat(cartItem.cost) || 0) * (parseInt(cartItem.Quantity) || 1);
    }, 0);
    
    setCost(newCost);
    updateCart(); // تحديث السياق
  };

  const itemTotal = (parseFloat(item.cost) || 0) * quantity;

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg">
      {/* صورة المنتج */}
      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
  {item.image_data ? (
    <img
      src={`data:image/jpeg;base64,${item.image_data}`}
      alt={item.name}
      className="w-full h-full object-cover"
    />
  ) : item.image_url ? (
    <img
      src={item.image_url}
      alt={item.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
      No Image
    </div>
  )}
</div>

      {/* تفاصيل المنتج */}
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-900">{item.name || 'Unknown Product'}</h3>
        
        {item.color && (
          <p className="text-xs text-gray-500">Color: {item.color}</p>
        )}
        {item.size && (
          <p className="text-xs text-gray-500">Size: {item.size}</p>
        )}
      </div>

      {/* التحكم في الكمية */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(quantity - 1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <FiMinus size={14} />
        </button>
        
        <span className="w-8 text-center font-medium">{quantity}</span>
        
        <button
          onClick={() => handleQuantityChange(quantity + 1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <FiPlus size={14} />
        </button>
      </div>

      
      {/* زر الحذف */}
      <button
        onClick={handleRemoveItem}
        className="w-8 h-8 rounded-full text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  );
}