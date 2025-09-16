import { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Page404 from './Page404';
import RateCost from '../components/RateCost';
import { motion } from "framer-motion";
import AddToCart from '../store/AddToCart';
import { CartCtx } from '../store/CartContext';
import HomeSliders from '../components/HomeSliders';
import { IoIosArrowForward } from "react-icons/io";
import Img from '../components/Img';

export default function Product() {
  const [MyProduct, setMyProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setCart, setCost } = useContext(CartCtx);
  const [Color, setColor] = useState('');
  const [Size, setSize] = useState('Any');
  const [Quantity, setQuantity] = useState(1);
  const { name } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://shopbackco.vercel.app/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        const products = Array.isArray(data) ? data : data.products || [];
        const decodedName = decodeURIComponent(name);
        const item = products.find(e => e.name.toLowerCase() === decodedName.toLowerCase());
        console.log('API Data:', data);
        console.log('Decoded Name:', decodedName);
        console.log('Found Product:', item);
        console.log('Image URL:', item?.image_url || item?.src);
        if (!item) {
          throw new Error('Product not found');
        }
        setMyProduct(item);
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
        setMyProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [name]);

  const handleSubmit = () => {
    const color = Color === '1' ? 'Yellow' :
                  Color === '2' ? 'Red' :
                  Color === '3' ? 'Green' :
                  Color === '4' ? 'Blue' :
                  Color === '5' ? 'Light Yellow' :
                  Color === '6' ? 'Light Red' :
                  Color === '7' ? 'Light Green' :
                  Color === '8' ? 'Light Blue' : 'Any';
    const size = Size;
    AddToCart({ ...MyProduct, color, size, Quantity }, setCart, setCost);
  };

  const Veri = () => {
    return (
      <div className='flex justify-center items-center'>
        <svg className="text-white w-6 h-6 mt-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };

  const handleSizeChanges = (el) => {
    return () => setSize(el === Size ? '' : el);
  };

  const handleColorChanges = (el) => {
    return () => setColor(el === Color ? '' : el);
  };

  const handleQuantityChange = (num) => {
    return () => {
      if (num === -1 && Quantity === 1) {
        return;
      }
      setQuantity(Quantity + num);
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !MyProduct) {
    return <Page404 />;
  }

  return (
    <>
      <div className='flex my-5 mainMargin items-center gap-4'>
        <Link to='/' className='text-gray-400'>Home</Link>
        <IoIosArrowForward color='gray' />
        <Link to='/Shop' className='text-gray-400'>Shop</Link>
        <IoIosArrowForward color='gray' />
        <span className='text-gray-600'>{MyProduct.name}</span>
      </div>
      <div className='flex flex-wrap justify-center gap-x-10 mainMargin h-fit'>
        <div className='bg-gray-100 flex-grow rounded-xl flex justify-center w-[80%]'>
      {MyProduct.image_data ? (
  <img
    className='w-[80%] object-contain'
    src={`data:image/jpeg;base64,${MyProduct.image_data}`}
    alt={MyProduct.name || 'Product'}
  />
) : MyProduct.image_url || MyProduct.src ? (
  <Img
    className='w-[80%]'
    src={MyProduct.image_url || MyProduct.src}
    alt={MyProduct.name || 'Product'}
    img={MyProduct.src?.split('/').pop().split('.')[0] || 'DefaultImage'}
  />
) : (
  <img
    className='w-[80%]'
    src='/default-image.jpg'
    alt='Default Product Image'
  />
)}

        </div>
        <div className='relative w-[100%-40px]'>
          <RateCost
            from='Product'
            name={MyProduct.name}
            stars={MyProduct.stars || 0}
            cost={MyProduct.cost || MyProduct.price || 0}
            discount={MyProduct.discount || 0}
          />
          <div>
            <div className='mt-10'></div>
            <hr />
            <div className='absolute -translate-y-4 right-10 bg-white'>Select Colors</div>
            <br />
            <div className='flex flex-wrap gap-3 items-end h-24'>
              {[
                { id: '1', color: 'bg-yellow-900', delay: 0 },
                { id: '2', color: 'bg-red-900', delay: 0.1 },
                { id: '3', color: 'bg-green-900', delay: 0.2 },
                { id: '4', color: 'bg-blue-900', delay: 0.3 },
                { id: '5', color: 'bg-yellow-500', delay: 0.4 },
                { id: '6', color: 'bg-red-500', delay: 0.5 },
                { id: '7', color: 'bg-green-500', delay: 0.6 },
                { id: '8', color: 'bg-blue-500', delay: 0.7 },
              ].map(({ id, color, delay }) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, x: -75 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay }}
                  onClick={handleColorChanges(id)}
                  className={`${color} w-8 h-8 rounded-full cursor-pointer`}
                >
                  {Color === id && <Veri />}
                </motion.div>
              ))}
            </div>
            <div className='mt-10'></div>
            <hr />
            <div className='absolute -translate-y-4 right-10 bg-white'>Choose Size</div>
            <div className='grid grid-cols-2 gap-4 mt-10 sm:flex sm:flex-wrap'>
              {['Small', 'Medium', 'Large', 'X-Large'].map((size, index) => (
                <motion.div
                  key={size}
                  initial={{ opacity: 0, x: -75 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={handleSizeChanges(size)}
                  className={`${Size === size ? 'bg-black text-white' : 'bg-gray-100'} cursor-pointer py-2 px-5 rounded-full w-full sm:w-auto text-xs md:text-sm`}
                >
                  {size}
                </motion.div>
              ))}
            </div>
            <div className='mt-10'></div>
            <hr />
            <div className='flex flex-col xsm:flex-row flex-wrap mt-10 gap-10'>
              <motion.div
                initial={{ opacity: 0, x: -75 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className='rounded-full select-none flex-grow xsm:flex-grow-0 p-3 xsm:p-0 xsm:w-[25%] flex justify-center items-center gap-5 bg-gray-100'
              >
                <span onClick={handleQuantityChange(-1)} className='text-4xl -mt-1 cursor-pointer flex-grow text-center'>-</span>
                <span className='font-bold'>{Quantity}</span>
                <span onClick={handleQuantityChange(1)} className='text-4xl -mt-1 cursor-pointer flex-grow text-center'>+</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -75 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className='flex-grow'
              >
                <button onClick={handleSubmit} className='bg-black w-full text-white px-5 py-4 rounded-full flex-grow hover:bg-gray-600'>Add to Cart</button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <HomeSliders text='You might also like' type={MyProduct.type} del='yes' id={MyProduct.id} />
    </>
  );
}