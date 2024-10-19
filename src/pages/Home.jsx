import { useEffect, useRef, memo } from 'react'

import { Link } from 'react-router-dom'
import Reavel from '../Reavel'
import { motion } from 'framer-motion'
import BrandsBar from '../components/BrandsBar'
import HomeSliders from '../components/HomeSliders'
import HappyCustomers from '../components/HappyCustomers'
import Img from '../components/Img'

export default function Home({ to = '' }) {
  const NewArrival = useRef()
  const TopSelling = useRef()
  const OnSale = useRef()

  useEffect(() => {
    if (to === '') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
      return;
    }
    if (to === 'NewArrival') {
      window.scrollTo({
        top: NewArrival.current.offsetTop,
        behavior: 'smooth'
      })
    } else if (to === 'TopSelling') {
      window.scrollTo({
        top: TopSelling.current.offsetTop,
        behavior: 'smooth'
      })
    } else if (to === 'OnSale') {
      window.scrollTo({
        top: OnSale.current.offsetTop,
        behavior: 'smooth'
      })
    }

  }, [to])

  return (
    <>
     <div className="pt-1 nav:flex flex-wrap justify-between items-end mainPadding">
  <div className="flex flex-col lg:flex-row items-center justify-between w-full">
    {/* القسم النصي */}
    <div className="nav:w-full lg:w-1/2 flex flex-col flex-grow lg:pr-10">
      <h1 className="bolded text-2xl sm:text-4xl md:text-6xl mb-5 sm:mb-10 max-w-[550px] whitespace-nowrap">
        <Reavel>FIND CLOTHES</Reavel> <Reavel>THAT MATCHES</Reavel> <Reavel>YOUR STYLE</Reavel>
      </h1>

      <p className="max-w-[550px] text-sm sm:text-base md:text-lg">
        Browse through our diverse range of meticulously crafted garments, <br className="hidden sm:inline" /> designed to bring out your individuality and cater to your sense of style.
      </p>

      <div className='mt-10'></div>
      <Reavel className='btnReavel flex' btn='w-full lg:w-fit'>
        <Link className="btn w-full lg:w-fit text-center" to='Shop'>Shop Now</Link>
      </Reavel>
      <div className='mb-10'></div>
      <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4">
        <div className="flex justify-center items-center w-full sm:w-auto">
          <div className="flex flex-col justify-center items-center border-r border-gray-300 pr-3">
            <Reavel>
              <h1 className="font-bold text-2xl sm:text-3xl tracking-wide">200+</h1>
            </Reavel>
            <Reavel>
              <p>International Brands</p>
            </Reavel>
          </div>

          <div className="flex flex-col justify-center items-center w-full sm:w-auto mt-4 sm:mt-0 pl-3 border-r border-gray-300 pr-3">
            <Reavel>
              <h1 className="font-bold text-2xl sm:text-3xl tracking-wide">2,000+</h1>
            </Reavel>
            <Reavel>
              <p>High-Quality Products</p>
            </Reavel>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center w-full sm:w-auto mt-4 sm:mt-0">
          <Reavel>
            <h1 className="font-bold text-2xl sm:text-3xl tracking-wide">30,000+</h1>
          </Reavel>
          <Reavel>
            <p>Happy Customers</p>
          </Reavel>
        </div>
      </div>
    </div>

    {/* الصورة */}
    <div 
      className="lg:w-1/2 w-full h-screen" 
      style={{ width: '100vw', height: '85%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
    >
      <img
        src="model.png"
        alt="Stylish couple wearing fashionable clothes"
        style={{ width: '100vw', height: '85%', objectFit: 'cover' }}
      />
    </div>
  </div>
</div>


      <BrandsBar />
      <div ref={NewArrival}>
        <HomeSliders text='NEW ARRIVALS' type='newarrival' />
      </div>
      <div ref={TopSelling}>
        <HomeSliders text='TOP SELLING' type='topselling' />
      </div>
      <div ref={OnSale}>
        <HomeSliders text='ON SALE' type='onsale' />
      </div>
      
      <HappyCustomers />
    </>
  )
}