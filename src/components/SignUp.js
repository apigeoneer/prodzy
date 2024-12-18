import { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Signup successful!");
    } catch (error) {
      alert("Error signing up: " + error.message);
    }
  };

  return (
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
  );
};

export default Signup;
