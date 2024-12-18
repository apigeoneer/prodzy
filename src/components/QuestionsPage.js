// src/components/QuestionsPage.js
import React, { useState, useEffect } from 'react';
import { getQuestions } from '../services/dataService';
import { Link } from 'react-router-dom';
import { timeAgo } from '../utils/formatTime';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuestions().then((data) => {
      setQuestions(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading questions...</p>;

  return (
    <div>
      <h2>Interview Questions</h2>
      {questions.length === 0 ? (
        <p>No questions available.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {questions.map((q) => {
            // Format postedAt as a readable string
            const postedTime = q.postedAt.toLocaleString();
            return (
              <li 
                key={q.id} 
                style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem', borderRadius: '4px' }}
              >
                <h3>{q.title}</h3>
                <p>{q.description}</p>
                <p>
                  <strong>Posted:</strong> {q.postedBy} {timeAgo(q.postedAt)} at {q.company}<br/>
                  <strong>Type:</strong> {q.type}
                </p>
                <Link to={`/questions/${q.id}/answers`}>
                  <button className="form-button">View Answers</button>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default QuestionsPage;

