import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Reavel from '../Reavel'
import { FaStar, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { SiteReviews as reviews } from '../store/Constants'

export default function HappyCustomers() {
  const [Width, setWidth] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const ref = useRef()

  useEffect(() => {
    setWidth(ref.current.scrollWidth - ref.current.offsetWidth)
  }, [])

  // الانتقال إلى العميل التالي
  const nextCustomer = () => {
    if (currentIndex < reviews.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  // العودة إلى العميل السابق
  const prevCustomer = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  return (
    <div className='mainMargin pb-10 pt-20'>
      {/* العنوان مع تعديل تقسيم الكلمات على الشاشات الصغيرة */}
      <h1 className='bolded text-2xl xsm:text-3xl sm:text-5xl text-center flex flex-wrap justify-center'>
  <span className="block xsm:inline">OUR HAPPY</span>
  <span className="block xsm:inline">CUSTOMERS</span>
</h1>


      {/* الأسهم أسفل العنوان */}
      <div className="flex justify-center gap-4 mt-4">
        {/* سهم الرجوع */}
        <FaArrowLeft
          className="block md:hidden cursor-pointer"
          onClick={prevCustomer}
        />
        {/* سهم التقدم */}
        <FaArrowRight
          className="block md:hidden cursor-pointer"
          onClick={nextCustomer}
        />
      </div>

      <div className="overflow-hidden mt-2" ref={ref}>
        <motion.div
          drag='x'
          dragConstraints={{ left: -Width, right: 0 }}
          whileTap={{ cursor: "grabbing" }}
          className="flex gap-16 cursor-pointer w-fit mt-10"
        >
          {/* عرض العملاء */}
          {
            reviews.map((el, index) => (
              <motion.div
                whileTap={{ scale: 0.95 }}
                key={index}
                // عرض عميل واحد فقط على الشاشات الصغيرة
                className={`flex flex-col gap-2 w-[350px] ${index === currentIndex ? 'block' : 'hidden'} sm:block`}
              >
                <Reavel>
                  <div className='flex gap-2'>
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                </Reavel>
                <Reavel>
                  <div className='flex gap-1 items-center'>
                    <h1 className='font-bold text-lg'>{el.name}</h1>
                    <MdVerified size={20} color='green' />
                  </div>
                </Reavel>
                <Reavel>
                  {/* عرض النص على أربع سطور فقط */}
                  <p className='w-full h-[6em] overflow-hidden'>{el.review}</p>
                </Reavel>
              </motion.div>
            ))
          }
        </motion.div>
      </div>
    </div>
  )
}
