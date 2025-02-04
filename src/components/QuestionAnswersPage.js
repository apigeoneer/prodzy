import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAnswersForQuestion } from '../services/dataService';
import { timeAgo } from '../utils/formatTime';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faComment, faShare } from '@fortawesome/free-solid-svg-icons';
import { collection, addDoc, doc, updateDoc, arrayUnion, getDoc, query, where, getDocs, arrayRemove, increment, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { serverTimestamp } from 'firebase/firestore';


const QuestionAnswersPage = () => {
  const { id } = useParams();
  const questionId = parseInt(id, 10);

  const [question, setQuestion] = useState(null);

  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [newAnswerText, setNewAnswerText] = useState("");

  // Initialize local state with the filtered and sorted answers
  const [answers, setAnswers] = useState([]);

  const ANSWER_PREVIEW_LIMIT = 200;
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const toggleAnswerExpand = (answerId) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [answerId]: !prev[answerId],
    }));
  };

  // const handleLike = async (answerId, currentlyLikedByUser) => {
  //   if (!answerId) {
  //     console.error("Invalid answer ID");
  //     return;
  //   }
  
  //   try {
  //     const answerRef = doc(db, "answers", answerId.toString());
  //     const answerDoc = await getDoc(answerRef);
  
  //     if (!answerDoc.exists()) {
  //       console.error("Answer document not found");
  //       return;
  //     }
  
  //     if (!auth.currentUser) {
  //       console.error("User not authenticated");
  //       return;
  //     }
  
  //     await updateDoc(answerRef, {
  //       likes: increment(currentlyLikedByUser ? -1 : 1),
  //       likedBy: currentlyLikedByUser 
  //         ? arrayRemove(auth.currentUser.uid)
  //         : arrayUnion(auth.currentUser.uid)
  //     });
  
  //     // Update local state
  //     setAnswers(prev => prev.map(answer => {
  //       if (answer.id === answerId) {
  //         return {
  //           ...answer,
  //           likes: currentlyLikedByUser ? answer.likes - 1 : answer.likes + 1,
  //           likedByUser: !currentlyLikedByUser
  //         };
  //       }
  //       return answer;
  //     }));
  //   } catch (error) {
  //     console.error("Error updating likes:", error);
  //   }
  // };

  // In QuestionAnswersPage.js, modify the handleLike function:
const handleLike = async (answerId, currentlyLikedByUser) => {
  console.log("Like button clicked:", { answerId, currentlyLikedByUser });

  if (!answerId || !auth.currentUser) {
    console.log("Missing answerId or user not authenticated:", { answerId, currentUser: auth.currentUser });
    alert("Please log in to like answers");
    return;
  }

  try {
    const answerRef = doc(db, "answers", answerId);
    console.log("Answer reference:", answerRef);

    const answerDoc = await getDoc(answerRef);
    console.log("Answer document:", answerDoc.data());

    if (!answerDoc.exists()) {
      console.log("Answer document not found:", answerId);
      return;
    }

    const currentData = answerDoc.data();
    const likedBy = currentData.likedBy || [];
    const likes = currentData.likes || 0;

    await updateDoc(answerRef, {
      likes: currentlyLikedByUser ? likes - 1 : likes + 1,
      likedBy: currentlyLikedByUser 
        ? arrayRemove(auth.currentUser.uid)
        : arrayUnion(auth.currentUser.uid)
    });

    setAnswers(prev => prev.map(answer => {
      if (answer.id === answerId) {
        return {
          ...answer,
          likes: currentlyLikedByUser ? answer.likes - 1 : answer.likes + 1,
          likedByUser: !currentlyLikedByUser
        };
      }
      return answer;
    }));

  } catch (error) {
    console.error("Error updating likes:", error);
  }
};
  
  const [commentInputs, setCommentInputs] = useState({}); 
    // commentInputs will be an object like { [index]: "comment text" }

  const handleCommentChange = (index, value) => {
    setCommentInputs({ ...commentInputs, [index]: value });
  };

  const handleAddComment = async (answerId, commentText) => {
    const answerDocRef = doc(db, "answers", answerId);
    console.log("Comment button clicked:", { answerId, commentText });

    if (!auth.currentUser) {
      alert("Please log in to comment");
      return;
    }
  
    try {
      const answerRef = doc(db, "answers", answerId);
      const answerDoc = await getDoc(answerRef);
      
      if (!answerDoc.exists()) {
        console.log("Answer not found");
        return;
      }
  
      await updateDoc(answerDocRef, {
        comments: arrayUnion({
          text: commentText.trim(),
          postedBy: auth.currentUser.uid,
          postedAt: Timestamp.fromDate(new Date()),
        }),
      });
  
      // Re-fetch answers to update UI
      const updatedAnswers = await getAnswersForQuestion(questionId);

      // setAnswers(updatedAnswers);

          // Update local state
    setAnswers(prev => prev.map(answer => {
      if (answer.id === answerId) {
        return {
          ...answer,
          comments: [...answer.comments || [], {
            text: commentText,
            postedBy: auth.currentUser.uid,
            postedAt: new Date()
          }]
        };
      }
      return answer;
    }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
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

const [editingAnswerId, setEditingAnswerId] = useState(null);
const [editAnswerText, setEditAnswerText] = useState("");

const startEditing = (answerId, currentText) => {
  setEditingAnswerId(answerId);
  setEditAnswerText(currentText);
};

const stopEditing = () => {
  setEditingAnswerId(null);
  setEditAnswerText("");
};

const handleUpdateAnswer = async (answerId, newText) => {
  const answerDocRef = doc(db, "answers", answerId);
  try {
    await updateDoc(answerDocRef, {
      text: newText
    });
    const updatedAnswers = await getAnswersForQuestion(questionId);
    setAnswers(updatedAnswers);
  } catch (error) {
    console.error("Error updating answer:", error);
  }
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
      const processedAnswers = data.map(answer => ({
        ...answer,
        likedByUser: answer.likedBy?.includes(auth.currentUser?.uid) || false,
        comments: answer.comments || []
      })).sort((a, b) => b.likes - a.likes);
  
      setAnswers(processedAnswers);
      setLoading(false);
    });
  }, [questionId]);

 
  // Fetch the question using a query by questionId field instead of document ID to eliminate any mismatch between questionId and Firestore Document ID
  useEffect(() => {
    const fetchQuestion = async () => {
      const answersRef = collection(db, "questions");
      const qQuery = query(answersRef, where("questionId", "==", questionId));
      const querySnapshot = await getDocs(qQuery);
  
      if (!querySnapshot.empty) {
        setQuestion(querySnapshot.docs[0].data());
      } else {
        setQuestion(null);
      }
    };
  
    fetchQuestion();
  }, [questionId]);  


  if (question === null) {
    return <p>Question not found.</p>;
  }

  const companyLogoSrc = question.company
  ? `/logos/${question.company.toLowerCase()}.svg`
  : '/logos/default.svg';

  if (loading) {
    return <p>Loading answers...</p>;
  }
  

  // We'll add form controls next
  return (
    <div>
      
    {/* <div className='question-detail'>
      <div className='question-detail-header'>
        <div><h3>{question.title}</h3></div>
        <div>{question.description}</div>
      </div>
      <div className='question-metadata'>
        <div><strong>Posted:</strong> {question.postedAt.toLocaleString()}</div>
        <div><strong>Posted By:</strong> {question.postedBy} at {question.company}</div>
        <div><strong>Question Type:</strong> {question.type}</div>
        <div>
          <strong>Asked at:</strong>
          <div className='question-metadata-company'>
            <img
             src={companyLogoSrc}
             alt={question.company || "Unknown Company"}
             style={{ width: '50px', height: '50px', objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>
    </div> */}

<div
  className="question-detail-container"
>
  <h3 style={{ marginBottom: "1rem", color: "#333" }}>{question.title}</h3>
  <p style={{ marginBottom: "1.5rem", color: "#555" }}>{question.description}</p>
  <div
    className="question-metadata"
  >
    <p style={{ margin: "0", color: "#666" }}>
      <strong>Posted:</strong>{" "}
      {new Date(question.postedAt.toDate()).toLocaleString()}
    </p>
    <p style={{ margin: "0", color: "#666" }}>
      <strong>Posted By:</strong> {question.postedBy}
    </p>
    <p style={{ margin: "0", color: "#666" }}>
      <strong>Question Type:</strong> {question.type}
    </p>
    <div style={{  margin: "0", color: "#666" }}>
      <strong>Asked at:</strong>
      <div
        style={{
          display: "inline-block",
          marginTop: "0.5rem",
          padding: "0.5rem",
          backgroundColor: "#f4f4f4",
          borderRadius: "4px",
          fontWeight: "bold",
        }}
      >
        {question.company.toUpperCase()}
      </div>
    </div>
  </div>
</div>



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
  const isLong = answer.text.length > ANSWER_PREVIEW_LIMIT;
  const expanded = expandedAnswers[answer.id];
  const displayedContent =
    isLong && !expanded
      ? answer.text.substring(0, ANSWER_PREVIEW_LIMIT) + "…"
      : answer.text;

  return (
    <li key={index} style={{ border: '1px solid #ddd', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '4px' }}>
      {/* <p>{answer.text}</p> */}
      {/* <p>{displayedContent}</p> */}
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedContent}</ReactMarkdown>


                {isLong && (
                  <button
                    onClick={() => toggleAnswerExpand(answer.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#800020",
                      cursor: "pointer",
                    }}
                  >
                    {expanded ? "Read Less" : "Read More"}
                  </button>
                )}
      <p><strong>By:</strong> {answer.postedBy} {timeAgo(answer.postedAt)}</p>
      <p><strong>Likes:</strong> {answer.likes}</p>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button className="form-button" onClick={() => handleLike(answer.id, answer.likedByUser)}>
          <FontAwesomeIcon icon={faThumbsUp} color={answer.likedByUser ? "blue" : "inherit"} />
        </button>
        <button className="form-button" onClick={() => toggleComments(index)}>
            <FontAwesomeIcon icon={faComment} />
        </button>
        <button className="form-button" onClick={() => handleShare(answer)}>
            <FontAwesomeIcon icon={faShare} />
        </button>

        {editingAnswerId === answer.id ? (
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await handleUpdateAnswer(answer.id, editAnswerText);
          stopEditing();
        }}
      >
        <textarea
          value={editAnswerText}
          onChange={(e) => setEditAnswerText(e.target.value)}
        />
        <button type="submit">Save</button>
        <button type="button" onClick={stopEditing}>Cancel</button>
      </form>
    ) : (
      answer.postedBy === auth.currentUser?.uid && (
        <button onClick={() => startEditing(answer.id, answer.text)}>
          Edit
        </button>
      )
    )}

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
                    <p><em>by {c.postedBy} on {c.postedAt.toDate().toLocaleString()}</em></p>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Comment form */}
          {/* <form onSubmit={(e) => handleCommentSubmit(index, e)}>
            <input
              className="form-input"
              type="text"
              placeholder="Add a comment..."
              value={commentInputs[index] || ""}
              onChange={(e) => handleCommentChange(index, e.target.value)}
            />
            <button className="form-button" type="submit">Submit Comment</button>
          </form> */}
          <form onSubmit={(e) => handleCommentSubmit(index, e)}>
            <input
              type="text"
              value={commentInputs[index] || ""}
              onChange={(e) => handleCommentChange(index, e.target.value)}
            />
            <button type="submit">Submit</button>
          </form>

          {/* <form onSubmit={(e) => {
              e.preventDefault();
              const text = commentInputs[index]?.trim();
              if (!text) return;

              handleAddComment(answer.id, text);
              setCommentInputs({ ...commentInputs, [index]: "" });
            }} style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentInputs[index] || ""}
              onChange={(e) => setCommentInputs({ ...commentInputs, [index]: e.target.value })}
            />
            <button type="submit" className="form-button">Submit</button>
          </form> */}

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

