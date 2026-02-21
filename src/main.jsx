import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

// Use placeholder when missing so useGoogleLogin hook is always available; real sign-in still requires valid .env
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '000000000000-placeholder.apps.googleusercontent.com'

function Root() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
