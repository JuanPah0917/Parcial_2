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
  const [showPassword, setShowPassword] = useState(false);
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
          <div style={{
            maxWidth: '400px',
            margin: '40px auto',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            backgroundColor: 'white',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
          }}>
            <h2 style={{
              textAlign: 'center',
              color: '#1DA1F2',
              marginBottom: '30px',
              fontSize: '24px'
            }}>Welcome to Mini X</h2>
            
            {error && (
              <p style={{
                color: '#dc3545',
                backgroundColor: '#ffe6e6',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {error}
              </p>
            )}
            
            {successMessage && (
              <p style={{
                color: '#28a745',
                backgroundColor: '#e6ffe6',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {successMessage}
              </p>
            )}
            
            {resetMessage && (
              <p style={{
                color: '#0066cc',
                backgroundColor: '#e6f7ff',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {resetMessage}
              </p>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#444',
                fontSize: '14px',
                fontWeight: '500'
              }}>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your Gmail address"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  transition: 'border-color 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#444',
                fontSize: '14px',
                fontWeight: '500'
              }}>Password:</label>
              <div style={{ 
                position: 'relative',
                display: 'flex',
                alignItems: 'center' 
              }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '40px', // Espacio para el botón
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    padding: '0',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#666'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <button
                onClick={handleForgotPassword}
                style={{
                  backgroundColor: 'transparent',
                  color: '#1DA1F2',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '8px 0',
                  textDecoration: 'none',
                  display: 'block',
                  marginTop: '8px'
                }}
              >
                Forgot Password?
              </button>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '10px',
              marginTop: '30px'
            }}>
              <button
                onClick={handleSignUp}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#1DA1F2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.3s ease',
                  ':hover': {
                    backgroundColor: '#0d8ed9'
                  }
                }}
              >
                Sign Up
              </button>
              <button
                onClick={handleSignIn}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#15202b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.3s ease',
                  ':hover': {
                    backgroundColor: '#192734'
                  }
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        }
      />
      <Route path="/profile" element={<Profile setEmail={setEmail} setPassword={setPassword} />} />
    </Routes>
  );
}

export default App;