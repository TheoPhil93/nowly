// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';  // Wenn du NextAuth verwendest

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Beispiel für NextAuth Login
    await signIn('credentials', { email, password });
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Anmelden</button>
      </form>
      <a href="/signup" className="text-link">
        Hast du noch kein Konto? Jetzt registrieren
      </a>
    </div>
  );
};

export default LoginForm;
