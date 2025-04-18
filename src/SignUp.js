import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { Link, useNavigate } from 'react-router-dom'; // ¡Link importado aquí!

function SignUp() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user) {
        await updateProfile(user, { displayName });
        await setDoc(doc(db, 'users', user.uid), {
          displayName,
          email,
        });
        navigate('/');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Crear Cuenta</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre de usuario:</label>
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Contraseña:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Registrarse</button>
      </form>
      <p>¿Ya tienes una cuenta? <Link to="/signin">Inicia sesión</Link></p>
    </div>
  );
}

export default SignUp;