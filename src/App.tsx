import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

import { getCategories } from './services/api';
import type { Category } from './types/Category';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';

/**
 * Root component of the React application.
 * Fetches categories on mount and renders header, counter, and information.
 *
 * @returns JSX element representing the application UI.
 */
function App() {
  /** Count state for the counter button. */
  const [count, setCount] = useState<number>(0);

  /**
   * Fetches the list of categories when the component mounts.
   * Logs the result or error to the console.
   */
  useEffect(() => {
    getCategories()
      .then((categories: Category[]) => {
        console.log('Fetched categories:', categories);
      })
      .catch((error: Error) => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  /**
   * Renders the application UI, including header, title, counter, and docs link.
   */
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <>
              {/* Header logos linking to Vite and React documentation */}
              <div>
                <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
                  <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
                  <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
              </div>

              {/* Main title */}
              <h1>Vite + React + TS Marketplace Clone</h1>

              {/* Counter card */}
              <div className="card">
                <button onClick={() => setCount((c) => c + 1)}>
                  count is {count}
                </button>
                <p>
                  Edit <code>src/App.tsx</code> to implement your marketplace client.
                </p>
              </div>

              {/* Documentation note */}
              <p className="read-the-docs">
                Click on the Vite and React logos to learn more.
              </p>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
