import React, { useState } from 'react';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Додати логіку входу
    alert(`Вхід: ${username}`);
  };

  const handleGoogleLogin = () => {
    // TODO: Додати логіку входу через Google
    alert('Вхід через Google');
  };

  const handleAppleLogin = () => {
    // TODO: Додати логіку входу через Apple
    alert('Вхід через Apple');
  };

  return (
    <div className="login-container">
      <h2>Вхід</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Увійти</button>
      </form>
      <div className="login-social">
        <button onClick={handleGoogleLogin} className="google-btn">Увійти через Google</button>
        <button onClick={handleAppleLogin} className="apple-btn">Увійти через Apple</button>
      </div>
    </div>
  );
};

export default Login; 