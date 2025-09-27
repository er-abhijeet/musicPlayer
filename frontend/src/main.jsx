import './index.css'
import App from './App'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import React from 'react'
import Room from './components/Room'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    // children: [
    //   {
    //     path: "",
    //     element: <Home />
    //   },
    //   {
    //     path: "about",
    //     element: <About />
    //   },
    //   {
    //     path: "contact",
    //     element: <Contact />
    //   }
    // ]
  },
  {
    path: '/room/:roomId',
    element: <Room />
  }
])



ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
          <RouterProvider router={router} />
    </React.StrictMode>
)
