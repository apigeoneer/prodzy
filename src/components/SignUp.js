import { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Signup successful!");
      navigate('/questions');
    } catch (error) {
      alert("Error signing up: " + error.message);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form className="auth-form" onSubmit={handleSignup}>
        <input 
            type="email" 
            placeholder="Email" 
            className="form-input"
            onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
        type="password" 
            placeholder="Password" 
            className="form-input"
            onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit" className="form-button">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
