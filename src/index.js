import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './Context/AuthProvider';
import './index.css';
// import reportWebVitals from './reportWebVitals';
import { disableReactDevTools } from '@fvilers/disable-react-devtools';

if (process.env.NODE_ENV === 'production') {
  disableReactDevTools();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>);
// reportWebVitals(console.log);