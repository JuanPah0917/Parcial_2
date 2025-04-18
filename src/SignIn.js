import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebaseConfig';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirigir al usuario a su timeline o perfil
    } catch (error) {
      setError(error.message);
    }
  };

  const handleResetPassword = async () => {
    setResetError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
    } catch (error) {
      setResetError(error.message);
      setResetEmailSent(false);
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSignIn}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Contraseña:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Iniciar Sesión</button>
      </form>
      <div>
        <button type="button" onClick={handleResetPassword}>Recuperar Contraseña</button>
        {resetEmailSent && <p style={{ color: 'green' }}>Se ha enviado un correo electrónico para restablecer tu contraseña.</p>}
        {resetError && <p style={{ color: 'red' }}>{resetError}</p>}
      </div>
    </div>
  );
}

export default SignIn;