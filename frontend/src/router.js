import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/Register';
import Hospitals from './pages/hospitals';
import Doctors from './pages/doctors';
import Appointments from './pages/appointments';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/register',
      element: <Register />,
    },
    {
      path: '/hospitals',
      element: <Hospitals />,
    },
    {
      path: '/doctors',
      element: <Doctors />,
    },
    {
      path: '/appointments',
      element: <Appointments />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);