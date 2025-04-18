import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import SignUp from './SignUp';
import SignIn from './SignIn';
import Profile from './Profile';
import Timeline from './Timeline';

function App() {
  return (
    <BrowserRouter> {/* Necesitas BrowserRouter para envolver las Routes */}
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Timeline />} /> {/* Timeline en la raíz */}
        <Route path="/timeline" element={<Timeline />} /> {/* También accesible en /timeline */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;