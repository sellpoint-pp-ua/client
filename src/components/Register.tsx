import React, { useState } from 'react';
import './Register.css';

const Register: React.FC = () => {
  const [surname, setSurname] = useState('');
  const [name, setName] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Додати логіку реєстрації
    alert(`Реєстрація: ${surname} ${name} ${patronymic} ${username}`);
  };

  return (
    <div className="register-container">
      <h2>Реєстрація</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <input
          type="text"
          placeholder="Прізвище"
          value={surname}
          onChange={e => setSurname(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Ім'я"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="По батькові (не обов'язково)"
          value={patronymic}
          onChange={e => setPatronymic(e.target.value)}
        />
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
        <button type="submit">Зареєструватися</button>
      </form>
    </div>
  );
};

export default Register; 