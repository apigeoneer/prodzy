import React from 'react';
import { useParams } from 'react-router-dom';
import questionsData from '../utils/questionsData';

const QuestionDetailPage = () => {
  const { id } = useParams();
  const questionId = parseInt(id, 10);
  const question = questionsData.find((q) => q.id === questionId);

  if (!question) {
    return <p>Question not found.</p>;
  }

  const postedTime = question.postedAt.toLocaleString();

  return (
    <div>
      <h2>{question.title}</h2>
      <p>{question.description}</p>
      <p>
        <strong>Posted:</strong> {postedTime} by {question.postedBy} at {question.company}<br/>
        <strong>Type:</strong> {question.type}
      </p>
      {/* Placeholder for future answers, likes, comments */}
    </div>
  );
};

export default QuestionDetailPage;
