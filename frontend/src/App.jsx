/** @format */

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatBot from './components/AIChatBot';
import Home from './pages/Home';
import Directory from './pages/Directory';
import AlumniDetail from './pages/AlumniDetail';
import HallOfFame from './pages/HallOfFame';
import Yearbook from './pages/Yearbook';
import Events from './pages/Events';
import EventRegistration from './pages/EventRegistration';
import Join from './pages/Join';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import BlogForm from './pages/BlogForm';

import Projects from './pages/Projects';
import Donations from './pages/Donations';
import Contact from './pages/Contact';
import ProjectDetail from './pages/ProjectDetail';
import Store from './pages/Store';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

const Induction = lazy(() => import('./pages/Induction'));

function App() {
  return (
    <Router>
      <div className='flex flex-col min-h-screen bg-white'>
        <Navbar />
        <main className='flex-grow'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route
              path='/induction'
              element={
                <Suspense
                  fallback={
                    <div
                      role='status'
                      className='flex min-h-[60vh] items-center justify-center bg-primary px-4 text-center font-bold text-white'>
                      Loading the induction page…
                    </div>
                  }>
                  <Induction />
                </Suspense>
              }
            />
            <Route path='/about' element={<About />} />
            <Route path='/alumni' element={<Directory />} />
            <Route path='/alumni/:id' element={<AlumniDetail />} />
            <Route path='/hall-of-fame' element={<HallOfFame />} />
            <Route path='/yearbook' element={<Yearbook />} />
            <Route path='/events' element={<Events />} />
            <Route
              path='/events/register/:name'
              element={<EventRegistration />}
            />
            <Route path='/join' element={<Join />} />
            <Route path='/blog' element={<Blog />} />
            <Route path='/blog/:slug' element={<BlogDetail />} />
            <Route path='/blog/create' element={<BlogForm />} />
            <Route
              path='/blog/edit/:slug'
              element={<BlogForm isEdit={true} />}
            />
            <Route path='/projects' element={<Projects />} />
            <Route path='/projects/:id' element={<ProjectDetail />} />
            <Route path='/donations' element={<Donations />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/store' element={<Store />} />
            <Route path='/store/:id' element={<ProductDetail />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/checkout' element={<Checkout />} />
            <Route path='/order-success/:id' element={<OrderSuccess />} />
          </Routes>
        </main>
        <AIChatBot />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
