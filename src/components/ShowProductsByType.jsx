import { useEffect, useState, useReducer } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import RateCost from './RateCost'
import { MdKeyboardArrowUp } from "react-icons/md";
import ReactSlider from 'react-slider'

const updateArrows = (state, action) => {
  switch (action.type) {
    case 'type':
      return { ...state, type: !state.type }
    case 'price':
      return { ...state, price: !state.price }
    case 'colors':
      return { ...state, colors: !state.colors }
    case 'style':
      return { ...state, style: !state.style }
    case 'filter':
      return { ...state, filter: !state.filter }
    default:
      return state
  }
}

const updateFilters = (state, action) => {
  switch (action.type) {
    case 'type':
      return { ...state, type: action.value }
    case 'price':
      return { ...state, price: action.value }
    case 'colors':
      return { ...state, colors: action.value }
    case 'colorbg':
      return { ...state, colorsbg: action.value }
    case 'style':
      return { ...state, style: action.value }
    default:
      return state
  }
}

const updateStyleCheckBox = (state, action) => {
  switch (action.type) {
    case 'cb1':
      return { cb1: !state.cb1, cb2: false, cb3: false, cb4: false }
    case 'cb2':
      return { cb1: false, cb2: !state.cb2, cb3: false, cb4: false }
    case 'cb3':
      return { cb1: false, cb2: false, cb3: !state.cb3, cb4: false }
    case 'cb4':
      return { cb1: false, cb2: false, cb3: false, cb4: !state.cb4 }
    default:
      return state
  }
}

const updateTypeCheckBox = (state, action) =>{
  switch (action.type) {
    case 'cb2':
      return { cb1: false, cb2: !state.cb2, cb3: false, cb4: false, cb5: false }
    case 'cb3':
      return { cb1: false, cb2: false, cb3: !state.cb3, cb4: false, cb5: false }
    case 'cb4':
      return { cb1: false, cb2: false, cb3: false, cb4: !state.cb4, cb5: false }
    case 'cb5':
      return { cb1: false, cb2: false, cb3: false, cb4: false, cb5: !state.cb5 }
    default:
      return state
  }
}

const filterClothes = (clothes, typeFilter, minPrice, maxPrice, styleFilter) => {
  
  if (!clothes || !Array.isArray(clothes) || clothes.length === 0) {
    console.log('Invalid clothes data:', clothes);
    return [];
  }
  
  return clothes.filter(item => {
   
    if (!item || typeof item !== 'object') {
      console.log('Invalid item:', item);
      return false;
    }
    
    
    if (typeFilter && item.type !== typeFilter && item.category !== typeFilter) {
      return false;
    }

   
    const itemCost = parseFloat(item.cost || item.price || 0);
    if (minPrice && itemCost < minPrice) {
      return false;
    }
    if (maxPrice && itemCost > maxPrice) {
      return false;
    }

    if (styleFilter && item.style !== styleFilter && item.style2 !== styleFilter) {
      return false;
    }

    return true;
  });
};

export default function ShowProductsByType({ MyProducts, setMyProducts }) {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search);

  const initFilltersArrows = {
    type: true,
    price: true,
    colors: true,
    colorsbg: true,
    style: true,
    filter: true
  }

  const initStyleCheckBox = {
    cb1: queryParams.get('style') === 'Casual' || false,
    cb2: queryParams.get('style') === 'Formal' || false,
    cb3: queryParams.get('style') === 'Party' || false,
    cb4: queryParams.get('style') === 'Gym' || false,
  }

  const initTypeCheckBox = {
    cb2: queryParams.get('type') === 'T-shirts' || false,
    cb3: queryParams.get('type') === 'Shirts' || false,
    cb4: queryParams.get('type') === 'Jeans' || false,
    cb5: queryParams.get('type') === 'Shorts' || false,
  }

  const initFillters = {
    type: queryParams.get('type') || '',
    price: [parseInt(queryParams.get('min')) || 0, parseInt(queryParams.get('max')) || 500],
    colorsbg: queryParams.get('colorbg') || 0,
    style: queryParams.get('style') || ''
  }

  const [Arrows, setArrows] = useReducer(updateArrows, initFilltersArrows)
  const [Filters, setFilters] = useReducer(updateFilters, initFillters)
  const [StyleCheckBox, setStyleCheckBox] = useReducer(updateStyleCheckBox, initStyleCheckBox)
  const [TypeCheckBox, setTypeCheckBox] = useReducer(updateTypeCheckBox, initTypeCheckBox)
  const [PriceRange, setPriceRange] = useState([Filters.price[0], Filters.price[1]])
  const [Products, setProducts] = useState([])

  useEffect(() => {
    console.log('MyProducts in ShowProductsByType:', MyProducts);
    
    if (Array.isArray(MyProducts) && MyProducts.length > 0) {
      const holder = filterClothes(MyProducts, Filters.type, Filters.price[0], Filters.price[1], Filters.style);
      setProducts(holder);
    } else {
      setProducts([]);
    }
  }, [Filters, MyProducts])

  useEffect(() => {
    if (!StyleCheckBox.cb1 && !StyleCheckBox.cb2 && !StyleCheckBox.cb3 && !StyleCheckBox.cb4) {
      queryParams.delete('style');
      navigate(`?${queryParams.toString()}`);
      setFilters({ type: 'style', value: '' })
    }
    const value = StyleCheckBox.cb1 ? 'Casual' : StyleCheckBox.cb2 ? 'Formal' : StyleCheckBox.cb3 ? 'Party' : StyleCheckBox.cb4 ? 'Gym' : '';
    if (value) handleFiltersChange('style', value);
  }, [StyleCheckBox])

  useEffect(() => {
    if (!TypeCheckBox.cb2 && !TypeCheckBox.cb3 && !TypeCheckBox.cb4 && !TypeCheckBox.cb5) {
      queryParams.delete('type');
      navigate(`?${queryParams.toString()}`);
      setFilters({ type: 'type', value: '' })
    }
    const value = TypeCheckBox.cb2 ? 'T-shirts' : TypeCheckBox.cb3 ? 'Shirts' : TypeCheckBox.cb4 ? 'Jeans' : TypeCheckBox.cb5 ? 'Shorts' : '';
    if (value) handleFiltersChange('type', value);
  }, [TypeCheckBox])

  const updateQueryParams = (newParams) => {
    const mergedParams = new URLSearchParams({
      ...Object.fromEntries(queryParams),
      ...newParams
    });
    navigate(`/Shop?${mergedParams.toString()}`);
  };

  const handleFiltersChange = (type, value) => {
    switch (type) {
      case 'type':
        updateQueryParams({ type: value });
        break;
      case 'price':
        updateQueryParams({ min: value[0], max: value[1] });
        break;
      case 'colorbg':
        updateQueryParams({ colorbg: value });
        break;
      case 'style':
        updateQueryParams({ style: value });
        break;
      default:
        break;
    }

    setFilters({ type, value })
  }

  const handleClick = (name) => {
    return () => {
      navigate(`/Shop/${encodeURIComponent(name)}`)
    }
  }

  const Veri = () => {
    return (
      <div className='flex justify-center items-center'>
        <svg className="text-white w-6 h-6 mt-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" >
          <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
        </svg>
      </div>
    )
  }

  // إضافة حالة التحميل إذا لم تكن المنتجات محملة بعد
  if (!MyProducts || (!Array.isArray(MyProducts) && MyProducts.length === undefined)) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // إذا كانت المنتجات مصفوفة فارغة، أظهر رسالة
  if (Array.isArray(MyProducts) && MyProducts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <h2 className="text-2xl font-bold text-gray-600">No products available</h2>
      </div>
    );
  }

  return (
    <div className='p-4 flex-grow gap-5 rounded-xl h-fit border-4 flex flex-col xs:max-w-[350px] xs:min-w-[350px] sm:max-w-[400px] sm:min-w-[400px] shop:max-w-[300px] shop:min-w-[300px]'>
      <div className='p-4 flex-grow gap-5 rounded-xl h-fit border-4 flex flex-col xs:max-w-[350px] xs:min-w-[350px] sm:max-w-[400px] sm:min-w-[400px] shop:max-w-[300px] shop:min-w-[300px]'>
        
        {/* ... (بقية كود الفلترز يبقى كما هو بدون تغيير) ... */}
        
      </div>

      {/* Products Display Section */}
      <div className='flex flex-col justify-center flex-grow flex-wrap gap-3 h-fit'>
        <h1 className='ml-10 mt-5 text-3xl font-bold'>
          {Filters.type ? Filters.type : 'All'} {Filters.style ? '->' : ''} {Filters.style}
        </h1>
        <div className='flex justify-center flex-grow flex-wrap gap-3 h-fit'>
          {Products.length ? (
            Products.map((el, index) => {
              // التحقق من وجود البيانات المطلوبة
              if (!el || !el.name) return null;
              
              return (
                <motion.div key={el.id || index} whileTap={{ scale: 0.95 }}>
                  <motion.div
                    variants={{
                      visible: { opacity: 1, x: 0 },
                      hidden: { opacity: 0, x: -75 }
                    }}
                    transition={{ delay: index * 0.1, type: 'just' }}
                    initial='hidden'
                    animate='visible'
                    className="flex flex-col w-[250px] h-[350px]"
                  >
                    <motion.div
                      className="bg-gray-100 rounded-xl cursor-pointer select-none h-48 overflow-hidden"
                      onClick={handleClick(el.name)}
                      whileHover={{ scale: 1.05 }}
                    >
                      {el.image_data ? (
                        <img
                          src={`data:image/jpeg;base64,${el.image_data}`}
                          alt={el.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                    </motion.div>
                    <RateCost 
                      name={el.name || 'Unknown Product'} 
                      stars={el.stars || 0} 
                      cost={el.price || el.cost || 0} 
                      discount={el.discount || 0} 
                    />
                  </motion.div>
                </motion.div>
              )
            })
          ) : (
            <h1 className='text-3xl mt-10 font-bold'>Sorry nothing here...</h1>
          )}
        </div>
      </div>
    </div>
  )
}