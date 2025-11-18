import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.less';
import './styles/system.less';
import './styles/reset.less';


const root = createRoot(document.getElementById('root')!)
root.render(<App />);
