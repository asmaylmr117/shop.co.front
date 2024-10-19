import { MdOutlineEmail } from "react-icons/md";
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import PaymentsLogos from "./PaymentsLogos";


export default function Footer() {
  return (
   <div>
      <div className="flex flex-wrap justify-between items-center p-5 bg-black mt-10 rounded-3xl w-full sm:w-[600px] sm:max-w-none sm:h-auto sm:rounded-3xl sm:justify-between sm:p-10 xsm:aspect-square xsm:w-full xsm:min-h-[300px]">
      <div className="bolded text-3xl xsm:text-4xl text-white mb-10 max-w-[600px] sm:mb-0 sm:max-w-full">
    STAY UP TO DATE ABOUT OUR <br /> LATEST OFFERS
  </div>
        <form className="flex flex-col gap-3 w-full sm:w-auto items-center">
          <div className="rounded-3xl bg-white p-2 flex w-full sm:w-auto">
            <MdOutlineEmail size={20} />
            <input className="text-black outline-none ml-2 w-full sm:w-[500px] sm:text-sm" placeholder="Enter your email address" />
          </div>
          <button type="submit" className="rounded-3xl bg-white p-2 text-black text-center w-full sm:w-[300px]  sm:text-sm">
            Subscribe to Newsletter
          </button>
        </form>
      </div>




      <footer>
      <div className="flex flex-wrap justify-between mt-10 gap-10">
  {/* قسم shop.co على اليسار */}
  <div id="1" className="flex-grow w-full lg:w-auto flex flex-col gap-10 ml-5 lg:ml-10">
    <h1 className="bolded text-3xl">SHOP.CO</h1>
    <p className="max-w-72 sm:max-w-full sm:text-left">
      We have clothes that suits your style and<br></br> which you’re proud to wear. From women to men.
    </p>
    <div className="flex gap-5">
      <FaXTwitter size={25} />
      <FaFacebook size={25} />
      <FaInstagram size={25} />
      <FaGithub size={25} />
    </div>
  </div>

  {/* الأقسام الأربعة */}
  <div className="grid grid-cols-2 gap-5 w-full sm:grid-cols-2 lg:flex lg:flex-grow lg:w-auto">
  
  {/* قسم company */}
  <div id="2" className="w-full flex flex-col gap-2 items-center lg:items-start text-xs sm:text-sm">
    <h1 className="font-semibold text-base sm:text-lg">Company</h1>
    <ul className="flex flex-col gap-1 sm:gap-2">
      <li className="Links">About</li>
      <li className="Links">Features of SHOP.CO</li>
      <li className="Links">Works</li>
      <li className="Links">Career</li>
    </ul>
  </div>

  {/* قسم help */}
  <div id="3" className="w-full flex flex-col gap-2 items-center lg:items-start text-xs sm:text-sm">
    <h1 className="font-semibold text-base sm:text-lg">Help</h1>
    <ul className="flex flex-col gap-1 sm:gap-2">
      <li className="Links">Customer Support</li>
      <li className="Links">Delivery Details</li>
      <li className="Links">Terms & Conditions</li>
      <li className="Links">Privacy Policy</li>
    </ul>
  </div>

  {/* قسم faq */}
  <div id="4" className="w-full flex flex-col gap-2 items-center lg:items-start text-xs sm:text-sm">
    <h1 className="font-semibold text-base sm:text-lg">FAQ</h1>
    <ul className="flex flex-col gap-1 sm:gap-2">
      <li className="Links">Account</li>
      <li className="Links">Manage Deliveries</li>
      <li className="Links">Orders</li>
      <li className="Links">Payments</li>
    </ul>
  </div>

  {/* قسم resources */}
  <div id="5" className="w-full flex flex-col gap-2 items-center lg:items-start text-xs sm:text-sm">
    <h1 className="font-semibold text-base sm:text-lg">Resources</h1>
    <ul className="flex flex-col gap-1 sm:gap-2">
      <li className="Links">Free eBooks</li>
      <li className="Links">Development Tutorial</li>
      <li className="Links">How to - Blog</li>
      <li className="Links">Youtube Playlist</li>
    </ul>
  </div>
</div>
</div>







        <div className="flex justify-center mt-10 gap-y-5 border-t-4 items-center flex-wrap">
          <div className="flex-grow text-center md:text-left">
            <a className="text-blue-800 ml-5  " href="https://protofolio-delta.vercel.app/"> by Eng: Mostafa Ismail Ibrahim  2024@</a>
          </div>
          <div className="w-fit">
            <PaymentsLogos />
          </div>
        </div>
      </footer>
      </div>
  );
}
