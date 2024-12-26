import React from 'react';
import { Link } from 'react-router-dom';


const Footer = () => {
  return (
    <footer style={{ background: '#f9f9f9', padding: '1rem', marginTop: '2rem' }}>
      <p>
        © 2024 Prodzy. All rights reserved.
        <Link to="/terms" style={{ marginLeft: '0.5rem' }}>Terms &amp; Conditions</Link> | 
        Follow Prodzy on <a href="https://twitter.com/myproduct">LinkedIn</a> for recent updates.
      </p>
    </footer>
  );
};

export default Footer;
