import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ConvexProvider, ConvexReactClient } from 'convex/react'; // added Convex imports

// Create a Convex client with your backend URL
const client = new ConvexReactClient('https://your-convex-app.convex.dev'); // replace with your Convex URL

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConvexProvider client={client}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);
