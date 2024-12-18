import React from 'react';
import { useParams } from 'react-router-dom';
import questionsData from '../utils/questionsData';
import answersData from '../utils/answersData';

const QuestionAnswersPage = () => {
  const { id } = useParams();
  const questionId = parseInt(id, 10);

  const question = questionsData.find((q) => q.id === questionId);
  const questionAnswers = answersData
    .filter((a) => a.questionId === questionId)
    .sort((a, b) => b.likes - a.likes); // Most liked first

  if (!question) {
    return <p>Question not found.</p>;
  }

  return (
    <div>
      <h2>{question.title}</h2>
      <p>{question.description}</p>
      <p>
        <strong>Posted:</strong> {question.postedAt.toLocaleString()} by {question.postedBy} at {question.company}<br/>
        <strong>Type:</strong> {question.type}
      </p>

      <h3>Answers (sorted by likes)</h3>
      {questionAnswers.length === 0 ? (
        <p>No answers yet. Be the first to add one!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {questionAnswers.map((answer, index) => (
            <li key={index} style={{ border: '1px solid #ddd', padding: '0.5rem', marginBottom: '0.5rem' }}>
              <p>{answer.text}</p>
              <p><strong>Likes:</strong> {answer.likes}</p>
              <p><strong>By:</strong> {answer.postedBy} on {answer.postedAt.toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuestionAnswersPage;
