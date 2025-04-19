import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Profile from './components/Profile';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();

  const isValidGmail = (email) => {
    const domain = email.split('@')[1];
    return domain === 'gmail.com';
  };

  const handleSignUp = async () => {
    setError('');
    setSuccessMessage('');
    setResetMessage('');

    if (!isValidGmail(email)) {
      setError('Only Gmail accounts are allowed. Please use a valid Gmail address.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccessMessage('Account created successfully! Please sign in with your credentials.');
      setEmail('');
      setPassword('');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please use Sign In.');
      } else {
        setError(error.message);
      }
    }
  };

  const handleSignIn = async () => {
    setError('');
    setSuccessMessage('');
    setResetMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/profile'); // Redirigir al perfil después de iniciar sesión
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setError('This account does not exist. Please use Sign Up.');
      } else {
        setError('Invalid email or password.');
      }
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setSuccessMessage('');
    setResetMessage('');

    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Password reset email sent! Please check your inbox.');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setError('This account does not exist. Please use Sign Up.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email format. Please check your email address.');
      } else {
        setError(`Error: ${error.message}`);
      }
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h2>Welcome</h2>
            {error && (
              <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px' }}>
                {error}
              </p>
            )}
            {successMessage && (
              <p style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px' }}>
                {successMessage}
              </p>
            )}
            {resetMessage && (
              <p style={{ color: 'blue', backgroundColor: '#e6f7ff', padding: '10px', borderRadius: '4px' }}>
                {resetMessage}
              </p>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your Gmail address"
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              <button
                onClick={handleForgotPassword}
                style={{
                  backgroundColor: 'transparent',
                  color: '#007BFF',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  marginTop: '5px',
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={handleSignUp}
                style={{ padding: '10px', backgroundColor: '#007BFF', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                Sign Up
              </button>
              <button
                onClick={handleSignIn}
                style={{ padding: '10px', backgroundColor: '#28A745', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                Sign In
              </button>
            </div>
          </div>
        }
      />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;