import { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      navigate('/questions');
    } catch (error) {
      alert("Error logging in: " + error.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form className="auth-form" onSubmit={handleLogin}>
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
        <button type="submit" className="form-button">Login</button>
    </form>
    </div>
  );
};

export default Login;
