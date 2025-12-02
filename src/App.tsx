import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
 import Login from './components/Login';
 import Index from './student_portal/index';
import Home from './page/Home';
import Agent from './agent/agent';
import ForgetPassword from './auth/forget';
import ResetPassword from './auth/reset';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
       <Route path="/index" element={<Index />} />
      <Route path="/agent" element={<Agent />} />
      <Route path="/forget" element={<ForgetPassword />} />
      <Route path="/reset" element={<ResetPassword />} />

    </Routes>
  );
};

export default App;
