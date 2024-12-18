import React, { useState, useEffect } from 'react';
import questionsData from '../utils/questionsData';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Simulate fetching data
    // Here we just set the mock data directly
    setQuestions(questionsData);
  }, []);

  return (
    <div>
      <h2>Interview Questions</h2>
      {questions.length === 0 ? (
        <p>Loading questions...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {questions.map((q) => (
            <li 
              key={q.id} 
              style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem', borderRadius: '4px' }}
            >
              <h3>{q.title}</h3>
              <p>{q.description}</p>
              <button>View Answers</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuestionsPage;

