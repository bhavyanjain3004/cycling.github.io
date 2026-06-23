import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BuildProvider } from './context/BuildContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BuildProvider>
      <App />
    </BuildProvider>
  </React.StrictMode>,
)
