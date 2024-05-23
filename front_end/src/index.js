import React, { Fragment } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css';
import reportWebVitals from './reportWebVitals';
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'

import Page from './page'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div className="min-h-full">
      <div className="py-4">
        <header className="no-print">
          <div className="flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Praia Bitcoin"
              width={100}
            />
          </div>
        </header>
        <main>
          <Page />
        </main>
      </div>
    </div>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
