// App.js
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import NavBar from '../components/NavBar';
import QuestionsPage from '../components/QuestionsPage';
import StoriesPage from '../components/StoriesPage';
import ProfilePage from '../components/ProfilePage';
import Login from '../components/Login';
import Signup from '../components/SignUp';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // currentUser is null if not logged in
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div>
        <h1>Welcome to the Product Platform</h1>
        <NavBar />

        {user ? (
          <div>
            <p>Logged in as: {user.email}</p>
            <button onClick={() => auth.signOut()}>Logout</button>
          </div>
        ) : (
          <div>
            <Link to="/login">Login</Link> | <Link to="/signup">Signup</Link>
          </div>
        )}

        <Routes>
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<div>Select a page from the nav</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
