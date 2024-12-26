import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import '../styles/style.css'
import NavBar from '../components/NavBar';
import QuestionsPage from '../components/QuestionsPage';
import StoriesPage from '../components/StoriesPage';
import ProfilePage from '../components/ProfilePage';
import Login from '../components/Login';
import Signup from '../components/SignUp';
import QuestionDetailPage from '../components/QuestionDetailPage';
import QuestionAnswersPage from '../components/QuestionAnswersPage';
import Breadcrumbs from "../components/Breadcrumbs";
import Footer from '../components/Footer';
import TermsConditions from '../components/TermsConditions';


const App = () => {
  const [user, setUser] = useState(null);
  const [showStatusBar, setShowStatusBar] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); 
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <header>
        <h1>Prodzy - Crack The Toughest PM Interveiws</h1>
      </header>

      <NavBar user={user} onLogout={() => auth.signOut()} />

      <div className="container">
        {showStatusBar && (
          <div className="status-bar">
            <div>
              {user ? (
                <p>Logged in as: {user.email}</p>
              ) : (
                <p>You are not logged in.</p>
              )}
            </div>
            {/* Close icon on top right */}
            <button 
              className="status-bar-close" 
              onClick={() => setShowStatusBar(false)}
              aria-label="Close status bar"
            >
              ✕
            </button>
          </div>
        )}

        <Breadcrumbs />

        <Routes>
          {/* checks if the user is logged in before rendering the login/signup pages */}
          {!user && <Route path="/login" element={<Login />} />}
          {!user && <Route path="/signup" element={<Signup />} />}
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/" element={<div>Home</div>} />
          <Route path="/questions/:id" element={<QuestionDetailPage />} /> 
          <Route path="/questions/:id/answers" element={<QuestionAnswersPage />} />
          <Route path="/terms" element={<TermsConditions />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
