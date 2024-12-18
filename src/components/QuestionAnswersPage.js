import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import questionsData from '../utils/questionsData';
import answersData from '../utils/answersData';

const QuestionAnswersPage = () => {
  const { id } = useParams();
  const questionId = parseInt(id, 10);

  const question = questionsData.find((q) => q.id === questionId);

  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [newAnswerText, setNewAnswerText] = useState("");

  // Initialize local state with the filtered and sorted answers
  const [answers, setAnswers] = useState([]);

  // Update likes for an answer
  const handleLike = (index) => {
    // Create a new array copy so we respect immutability
    const updatedAnswers = [...answers];
    updatedAnswers[index] = {
      ...updatedAnswers[index],
      likes: updatedAnswers[index].likes + 1
    };
    setAnswers(updatedAnswers);
  };


  // When we load answers in useEffect, ensures every answer object has a comments field. If comments didn’t exist before, we set it to []
  useEffect(() => {
    const filteredAnswers = answersData
      .filter((a) => a.questionId === questionId)
      .sort((a, b) => b.likes - a.likes)
      .map((answer) => ({
        ...answer,
        comments: answer.comments || []
      }));
    
    setAnswers(filteredAnswers);
  }, [questionId]);

  if (!question) {
    return <p>Question not found.</p>;
  }

  // We'll add form controls next
  return (
    <div>
      <h2>{question.title}</h2>
      <p>{question.description}</p>
      <p>
        <strong>Posted:</strong> {question.postedAt.toLocaleString()} by {question.postedBy} at {question.company}<br/>
        <strong>Type:</strong> {question.type}
      </p>

    {/* Add the button to toggle the answer form */}
    <button className="form-button" onClick={() => setShowAnswerForm(!showAnswerForm)}>
      {showAnswerForm ? "Cancel" : "Answer this Question"}
    </button>

    {/* Conditionally render the form if showAnswerForm is true */}
    {showAnswerForm && (
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (!newAnswerText.trim()) return;

          const newAnswer = {
            questionId: questionId,
            text: newAnswerText.trim(),
            postedBy: "currentUser",
            postedAt: new Date(),
            likes: 0,
            comments: []
          };

          setAnswers([newAnswer, ...answers]);
          setNewAnswerText("");
          setShowAnswerForm(false);
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', margin: '1rem 0' }}
      >
        <textarea
          className="form-input"
          rows="5"
          placeholder="Write your answer here..."
          value={newAnswerText}
          onChange={(e) => setNewAnswerText(e.target.value)}
        />
        <button type="submit" className="form-button">Submit Answer</button>
      </form>
    )}

    {/* All answers (sorted by likes) */}

      <h2>All Answers</h2>
      {answers.length === 0 ? (
        <p>No answers yet. Be the first to add one!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {answers.map((answer, index) => (
            <li key={index} style={{ border: '1px solid #ddd', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '4px' }}>
              <p>{answer.text}</p>
              <p><strong>Likes:</strong> {answer.likes}</p>
              <p><strong>By:</strong> {answer.postedBy} on {answer.postedAt.toLocaleString()}</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button className="form-button" onClick={() => handleLike(index)}>Like</button>
                <button className="form-button">Comment</button>
                <button className="form-button">Share</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuestionAnswersPage;
