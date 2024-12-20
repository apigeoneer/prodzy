import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAnswersForQuestion } from '../services/dataService';
import { timeAgo } from '../utils/formatTime';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faComment, faShare } from '@fortawesome/free-solid-svg-icons';
import { collection, addDoc, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebase';


const QuestionAnswersPage = () => {
  const { id } = useParams();
  const questionId = parseInt(id, 10);

  const [question, setQuestion] = useState(null);

  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [newAnswerText, setNewAnswerText] = useState("");

  // Initialize local state with the filtered and sorted answers
  const [answers, setAnswers] = useState([]);

  const handleLike = async (answerId, currentLikes, currentlyLikedByUser) => {
    const answerDocRef = doc(db, "answers", answerId);
    const newLikesCount = currentlyLikedByUser ? currentLikes - 1 : currentLikes + 1;
  
    await updateDoc(answerDocRef, {
      likes: newLikesCount
    });
  
    // Option A: Re-fetch data
    const updatedAnswers = await getAnswersForQuestion(questionId);
    setAnswers(updatedAnswers);
  
    // Option B: Optimistic update
    // setAnswers(prev => prev.map(a =>
    //   a.id === answerId ? { ...a, likes: newLikesCount, likedByUser: !currentlyLikedByUser } : a
    // ));
  };
  

  const [commentInputs, setCommentInputs] = useState({}); 
    // commentInputs will be an object like { [index]: "comment text" }

  const handleCommentChange = (index, value) => {
    setCommentInputs({ ...commentInputs, [index]: value });
  };

  const handleAddComment = async (answerId, commentText) => {
    const answerDocRef = doc(db, "answers", answerId);
  
    await updateDoc(answerDocRef, {
      comments: arrayUnion({
        text: commentText.trim(),
        postedBy: "currentUser",
        postedAt: new Date()
      })
    });
  
    // After updating, re-fetch answers so the UI updates
    const updatedAnswers = await getAnswersForQuestion(questionId);
    setAnswers(updatedAnswers);
  };

const handleCommentSubmit = async (index, e) => {
  e.preventDefault();
  const text = commentInputs[index]?.trim();
  if (!text) return;

  await handleAddComment(answers[index].id, text);
  setCommentInputs({ ...commentInputs, [index]: "" });
};

const [commentsVisibility, setCommentsVisibility] = useState({});

const toggleComments = (index) => {
    setCommentsVisibility((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Allow user to share an answer
  const handleShare = (answer) => {
    // For now, just show an alert. In the future, you can copy a URL to clipboard.
    alert(`Share this link: https://example.com/questions/${questionId}/answers`);
  };

  const [loading, setLoading] = useState(true);

  // Store answer data in Firestore so that it persists
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswerText.trim()) return;
  
    const newAnswer = {
      questionId,
      text: newAnswerText.trim(),
      postedBy: "currentUser",
      postedAt: new Date(),
      likes: 0,
      comments: [],  // Initially empty array
      likedByUser: false
    };
  
    await addDoc(collection(db, "answers"), newAnswer);
    
    // Re-fetch answers
    const updatedAnswers = await getAnswersForQuestion(questionId);
    setAnswers(updatedAnswers);
  
    // Clear the input
    setNewAnswerText("");
  };

  // Fetch questions from Firestore
  useEffect(() => {
    const fetchQuestion = async () => {
      const questionDocRef = doc(db, "questions", String(questionId));
      const questionSnap = await getDoc(questionDocRef);
      if (questionSnap.exists()) {
        setQuestion(questionSnap.data());
      } else {
        setQuestion(null);
      }
    };
  
    fetchQuestion();
  }, [questionId]);

  // Handle the initial load of answers
  useEffect(() => {
    setLoading(true);
    getAnswersForQuestion(questionId).then((data) => {
      const processedAnswers = data
        .sort((a, b) => b.likes - a.likes)
        .map((answer) => ({
          ...answer,
          comments: answer.comments || [],
          likedByUser: answer.likedByUser || false   // Allow a user to only like an answer once
        }));
  
      setAnswers(processedAnswers);
      setLoading(false);
    });
  }, [questionId]);


  if (question === null) {
    return <p>Question not found.</p>;
  }

  if (loading) {
    return <p>Loading answers...</p>;
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
        onSubmit={handleSubmitAnswer}
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

    <hr style={{ margin: '1.5rem 0', border: 'none', borderBottom: '1px solid #ccc' }} />

    {/* All answers (sorted by likes) */}

      <h2>All Answers</h2>
      {answers.length === 0 ? (
        <p>No answers yet. Be the first to add one!</p>
      ) : (
<ul style={{ listStyle: 'none', padding: 0 }}>
{answers.map((answer, index) => {
  const isCommentsVisible = commentsVisibility[index] || false;
  return (
    <li key={index} style={{ border: '1px solid #ddd', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '4px' }}>
      <p>{answer.text}</p>
      <p><strong>Likes:</strong> {answer.likes}</p>
      {/* <p><strong>By:</strong> {answer.postedBy} on {answer.postedAt.toLocaleString()}</p> */}
      <p><strong>By:</strong> {answer.postedBy} {timeAgo(answer.postedAt)}</p>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
      <button className="form-button" onClick={() => handleLike(answer.id, answer.likes, answer.likedByUser)}>
        <FontAwesomeIcon icon={faThumbsUp} color={answer.likedByUser ? "blue" : "inherit"} />
        </button>
        <button className="form-button" onClick={() => toggleComments(index)}>
            <FontAwesomeIcon icon={faComment} />
        </button>
        <button className="form-button" onClick={() => handleShare(answer)}>
            <FontAwesomeIcon icon={faShare} />
        </button>
    </div>

      {/* Conditionally render comments & comment form */}
      {isCommentsVisible && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid #ccc', paddingTop: '0.5rem' }}>
          {answer.comments.length > 0 && (
            <>
              <h4>Comments:</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {answer.comments.map((c, cIndex) => (
                  <li key={cIndex} style={{ border: '1px solid #eee', marginBottom: '0.5rem', padding: '0.5rem', borderRadius: '4px' }}>
                    <p>{c.text}</p>
                    <p><em>by {c.postedBy} on {c.postedAt.toLocaleString()}</em></p>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Comment form */}
          <form onSubmit={(e) => handleCommentSubmit(index, e)} style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input
              className="form-input"
              type="text"
              placeholder="Add a comment..."
              value={commentInputs[index] || ""}
              onChange={(e) => handleCommentChange(index, e.target.value)}
            />
            <button className="form-button" type="submit">Submit Comment</button>
          </form>
        </div>
      )}
    </li>
  );
})}

</ul>

      )}
    </div>
  );
};

export default QuestionAnswersPage;

