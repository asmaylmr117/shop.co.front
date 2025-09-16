import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Error from "./pages/Error";
import Root from "./pages/Root";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Product from "./pages/Product";
import Profile from "./pages/Profile";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminReviews from "./pages/AdminReviews";
import Orders from "./pages/orders";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { AuthProvider } from './AuthContext';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <Error />,
    children: [
      { path: "", element: <Home /> },
      { path: "SignUp", element: <SignUp /> },
      { path: "Login", element: <Login /> },
      { path: "Shop", element: <Shop /> },
      { path: "Cart", element: <Cart /> },
      { path: "Profile", element: <Profile /> },
      { path: "AdminProducts", element: <AdminProducts /> },
      { path: "AdminOrders", element: <AdminOrders /> },
      { path: "AdminReviews", element: <AdminReviews /> },
      { path: "Orders", element: <Orders /> },
      { path: "About", element: <About /> }, 
      { path: "Contact", element: <Contact /> },
      { path: "Shop/:name", element: <Product /> },
      { path: "NewArrival", element: <Home to='NewArrival' /> },
      { path: "TopSelling", element: <Home to='TopSelling' /> },
      { path: "OnSale", element: <Home to='OnSale' /> },
    ]
  },
]);

function App() {
  return (
    <AuthProvider>
      <div>
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  );
}

export default App;