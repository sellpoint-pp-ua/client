import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { getCategories } from './services/api';
import { Category } from './types/Category';

/// <summary>
/// Root component of the React application.
/// Fetches categories on mount and renders header, counter, and info.
/// </summary>
function App() {
  /// <summary>
  /// State for the counter button.
  /// </summary>
  const [count, setCount] = useState<number>(0);

  /// <summary>
  /// Fetches category list once when component mounts.
  /// Logs result or error to console.
  /// </summary>
  useEffect(() => {
    getCategories()
      .then((categories: Category[]) => {
        console.log('Fetched categories:', categories);
      })
      .catch((error: Error) => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  /// <summary>
  /// Renders application UI including logos, title, counter, and docs link.
  /// </summary>
  return (
    <>
      {/* Header logos linking to Vite and React docs */}
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
  );
}

export default App;
