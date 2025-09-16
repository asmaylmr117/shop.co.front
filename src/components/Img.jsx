import Svg1 from '../Svgs/Svg1.svg'
import Svg2 from '../Svgs/Svg2.svg'
import Svg3 from '../Svgs/Svg3.svg'
import Svg4 from '../Svgs/Svg4.svg'
import Svg5 from '../Svgs/Svg5.svg'
import Svg6 from '../Svgs/Svg6.svg'
import Svg7 from '../Svgs/Svg7.svg'
import Svg8 from '../Svgs/Svg8.svg'
import Svg9 from '../Svgs/Svg9.svg'
import Svg11 from '../Svgs/Svg11.svg'
import Svg12 from '../Svgs/Svg12.svg'
import Svg13 from '../Svgs/Svg13.svg'
import Svg14 from '../Svgs/Svg14.svg'
import Svg15 from '../Svgs/Svg15.svg'
import MainSvg from '../Svgs/Main.svg'
import Vector from '../Svgs/Vector.svg'
import Empty from '../Svgs/Empty.svg'
import Error from '../Svgs/Error.svg'
import Confirm from '../Svgs/Confirm.svg'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Img({from='any', img, src, ...prop}) {
  const [myImg, setMyImg] = useState();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // إذا كان هناك src (URL خارجي)، استخدمه مباشرة
    if (src && (src.startsWith('http') || src.startsWith('https') || src.startsWith('/'))) {
      setMyImg(src);
      setImageError(false);
      return;
    }

    // وإلا استخدم النظام القديم للـ SVGs المحلية
    if(img === '1') setMyImg(Svg1)
    if(img === '2') setMyImg(Svg2)
    if(img === '3') setMyImg(Svg3)
    if(img === '4') setMyImg(Svg4)
    if(img === '5') setMyImg(Svg5)
    if(img === '6') setMyImg(Svg6)
    if(img === '7') setMyImg(Svg7)
    if(img === '8') setMyImg(Svg8)
    if(img === '9') setMyImg(Svg9)
    if(img === '11') setMyImg(Svg11)
    if(img === '12') setMyImg(Svg12)
    if(img === '13') setMyImg(Svg13)
    if(img === '14') setMyImg(Svg14)
    if(img === '15') setMyImg(Svg15)
    if(img === 'BlackStar') setMyImg(Vector)
    if(img === 'ManAndWomen') setMyImg(MainSvg)
    if(img === 'Empty') setMyImg(Empty)
    if(img === 'Error') setMyImg(Error)
    if(img === 'Confirm') setMyImg(Confirm)
  }, [src, img])

  const handleImageError = () => {
    setImageError(true);
    // في حالة فشل تحميل الصورة، استخدم صورة الخطأ
    setMyImg(Error);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  return (
    <div className={prop.className}>
      {myImg ? (
        <img 
          draggable='false' 
          className='w-full h-full object-contain' 
          src={myImg} 
          alt={prop.alt || ""} 
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      ) : (
        <div className='w-full h-full flex items-center justify-center bg-gray-200 rounded'>
          <span className='text-gray-500'>Loading...</span>
        </div>
      )}
    </div>
  )
}