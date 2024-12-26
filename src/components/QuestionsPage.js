// src/components/QuestionsPage.js
import React, { useState, useEffect } from 'react';
import { getQuestions } from '../services/dataService';
import { Link } from 'react-router-dom';
import { timeAgo } from '../utils/formatTime';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newType, setNewType] = useState("");

  const QUESTION_TYPES = [
    "Product Design",
    "Product Improvement",
    "Behavioral",
    "Strategy",
    "Guesstimate",
    "Metrics"
  ];
  

  useEffect(() => {
    // Initially fetch questions on mount
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    const data = await getQuestions();
    setQuestions(data);
    setLoading(false);
  };

  // Store question data in Firestore so that it persists
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!newTitle.trim() || !newDescription.trim() || !newCompany.trim() || !newType) {
      alert("Please provide all title, description, company and type.");
      return;
    }
    

    // Create the new question object
    const newQuestion = {
      title: newTitle.trim(),
      description: newDescription.trim(),
      // postedAt: new Date(),
      postedAt: Timestamp.fromDate(new Date()), // Firebase expcets Timestamp objects for dates
      postedBy: "Anonymous",
      likes: 0,
      company: newCompany.trim() || "",
      type: newType.trim() || "",
      questionId: questions.length + 1
    };

    console.log("New Question Object:", newQuestion);

    try {
      // 1. Add the new question to Firestore
      await addDoc(collection(db, "questions"), newQuestion);

      // 2. Re-fetch or Optimistically Update State

      // Option A: Re-Fetch Questions (simpler, ensures data is always accurate)
      await fetchQuestions();

      // Option B (Alternate): Optimistically add to state without refetching:
      // setQuestions((prev) => [newQuestion, ...prev]);

      // Clear form inputs after successful submission
      setNewTitle("");
      setNewDescription("");
      setNewCompany("");
      setNewType("");

    } catch (error) {
      console.error("Error adding question:", error);
      alert("Failed to add question. Check console for details.");
    }
  };

  // Handle the initial load of questions
  useEffect(() => {
    setLoading(true);
    getQuestions().then((data) => {
      setQuestions(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading questions...</p>;

  console.log("Questions array:", questions);

  return (
    <div>
      <h2>PM Interview Questions</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <input 
          type="text" 
          placeholder="Question Title" 
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)} 
          style={{ display: 'block', marginBottom: '0.5rem', width: '300px' }} 
        />
        <input 
          type="text" 
          placeholder="Company (optional)" 
          value={newCompany} 
          onChange={(e) => setNewCompany(e.target.value)} 
          style={{ display: 'block', marginBottom: '0.5rem', width: '300px' }} 
        />
        {/* <label htmlFor="questionType">Type</label> */}
        <select
          id="questionType"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          style={{ display: 'block', marginBottom: '0.5rem', width: '300px' }}
        >
        <option value="">-- Select Type --</option>
          {QUESTION_TYPES.map((option) => (
          <option key={option} value={option}>
          {option}
        </option>
        ))}
        </select>
        <textarea 
          placeholder="Question Description" 
          value={newDescription} 
          onChange={(e) => setNewDescription(e.target.value)} 
          rows="3"
          style={{ display: 'block', marginBottom: '0.5rem', width: '300px' }} 
        />
        <button type="submit">Add Question</button>
      </form>

      {questions.length === 0 ? (
        <p>No questions yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {questions.map((q) => {
            // Format postedAt as a readable string
            const postedTime = q.postedAt.toLocaleString();
            const companyLogoSrc = q.company
            ? `/logos/${q.company.toLowerCase()}.svg`
            : "/logos/default.svg";
            return (
              <li 
                key={q.questionId} 
                style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem', borderRadius: '4px' }}
              >
                <h3>{q.title}</h3>
                <p>{q.description}</p>
                <p>
                  <strong>Posted:</strong> {q.postedBy} {timeAgo(q.postedAt)} at {q.company}<br/>
                  <strong>Type:</strong> {q.type}<br/>
                  <div>
                    <div><strong>Asked at:</strong></div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <img
                        src={companyLogoSrc}
                        alt={q.company || "Unknown Company"}
                        style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                    />
                    </div>
                  </div>
                </p>
                <Link to={`/questions/${q.questionId}/answers`}>
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

