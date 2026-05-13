import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import RateCost from "./RateCost";
import { useNavigate } from "react-router-dom";
import Img from "./Img";

export default function ImgSlider({ type, del = 'no', id }) {
  const [Width, setWidth] = useState(0)
  const [apiProducts, setApiProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const ref = useRef()
  const mainDiv = useRef()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://shopbackco.vercel.app/api/products');
        const data = await response.json();
        let productsArray = [];
        if (Array.isArray(data)) {
          productsArray = data;
        } else if (data && Array.isArray(data.products)) {
          productsArray = data.products;
        } else if (data && Array.isArray(data.data)) {
          productsArray = data.data;
        } else if (data && typeof data === 'object') {
          const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            productsArray = possibleArrays[0];
          }
        }
        setApiProducts(productsArray);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const ProductsByType = apiProducts.filter(el => {
    const isSameType = type ? el.category === type || el.type === type : true;
    const isNotCurrent = del === 'no' ? true : el.id !== id;
    return isSameType && isNotCurrent;
  }).slice(0, 8); // Display up to 8 products

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ref.current) {
        setWidth(ref.current.scrollWidth - ref.current.offsetWidth)
      }
    }, 100);
    return () => {
      clearTimeout(timer);
    }
  }, [ProductsByType])

  const handleClick = (name) => {
    return () => {
      navigate(`/Shop/${encodeURIComponent(name)}`)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (ProductsByType.length === 0) {
    return <div className="text-center text-gray-500 py-10">No recommendations available.</div>;
  }

  return (
    <div className="overflow-hidden mt-10 px-4 sm:px-6 md:px-8 " ref={ref}>
      <motion.div
        drag="x"
        dragConstraints={{ left: -Width, right: 0 }}
        whileTap={{ cursor: "grabbing" }}
        ref={mainDiv}
        className="w-fit cursor-pointer">
        <div className="flex gap-5">
          {
            ProductsByType.map((el, index) => {
              return (
                <motion.div key={el.id || index} whileTap={{ scale: 0.95 }}>
                  <motion.div
                    variants={{
                      visible: { opacity: 1, x: 0 },
                      hidden: { opacity: 0, x: -75 }
                    }}
                    transition={{ delay: index * 0.1, type: 'just' }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="flex flex-col w-[160px] h-[260px] sm:w-[170px] sm:h-[270px] md:w-[200px] md:h-[300px] lg:w-[250px] lg:h-[350px]"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gray-100 rounded-xl select-none overflow-hidden"
                      onClick={handleClick(el.name)}>
                      {el.image_data ? (
                        <img
                          className="w-full h-[170px] sm:h-[220px] object-cover" draggable="false" 
                          src={`data:image/jpeg;base64,${el.image_data}`} alt={el.name} />
                      ) : el.image_url || el.src ? (
                        <Img
                          img={el.src?.split("/").pop().split(".")[0] || 'Default'}
                          className="w-full h-[170px] sm:h-[220px] object-cover" draggable="false" src={el.image_url || el.src} alt={el.name} />
                      ) : (
                        <div className="w-full h-[170px] sm:h-[220px] bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                    </motion.div>
                    <RateCost name={el.name} stars={el.stars || 0} cost={el.price || el.cost || 0} discount={el.discount || 0} />
                  </motion.div>
                </motion.div>
              );
            })
          }
        </div>
      </motion.div>
    </div>
  )
}
