import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

declare global {
  interface Window {
    WPCRAFT_CONFIG: {
      postId: number
      postTitle: string
      nonce: string
      apiBase: string
      pageData: any
      hasExistingContent: boolean
      siteUrl: string
      adminUrl: string
    }
  }
}

ReactDOM.createRoot(
  document.getElementById('wpcraft-editor')!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
