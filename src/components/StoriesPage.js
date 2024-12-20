import React, { useState, useEffect } from 'react';
import { getStories } from '../services/dataService';
import { timeAgo } from '../utils/formatTime'; // if using relative times
import { collection, addDoc} from 'firebase/firestore';
import { db } from '../firebase';


const StoriesPage = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryContent, setNewStoryContent] = useState("");

  // Handle the initial load of stories
  useEffect(() => {
    setLoading(true);
    getStories().then((data) => {
      // Add any default fields if needed
      const processed = data.map(story => ({
        ...story,
        comments: story.comments || [],
        likedByUser: story.likedByUser || false
      }));
      setStories(processed);
      setLoading(false);
    });
  }, []);


  // Store story data in Firestore so that it persists
  const handleSubmitStory = async (e) => {
    e.preventDefault();
    if (!newStoryTitle.trim() || !newStoryContent.trim()) return;
  
    const newStory = {
      title: newStoryTitle.trim(),
      content: newStoryContent.trim(),
      postedBy: "currentUser",
      postedAt: new Date(),
      likes: 0,
      comments: [],
      likedByUser: false
    };
  
    await addDoc(collection(db, "stories"), newStory);
  
    // Re-fetch stories
    const updatedStories = await getStories();
    setStories(updatedStories);
  
    setNewStoryTitle("");
    setNewStoryContent("");
    setShowStoryForm(false);
  };

  const handleShareStory = (e) => {
    e.preventDefault();
    if (!newStoryTitle.trim() || !newStoryContent.trim()) return;

    const newStory = {
      id: stories.length + 1,
      title: newStoryTitle.trim(),
      content: newStoryContent.trim(),
      postedBy: "currentUser",
      postedAt: new Date(),
      likes: 0,
      comments: [],
      likedByUser: false
    };

    setStories([newStory, ...stories]);
    setNewStoryTitle("");
    setNewStoryContent("");
    setShowStoryForm(false);
  };

  if (loading) return <p>Loading stories...</p>;

  return (
    <div>
      <h2>Stories</h2>
      <button className="form-button" onClick={() => setShowStoryForm(!showStoryForm)}>
        {showStoryForm ? "Cancel" : "Share Your Story"}
      </button>

      {showStoryForm && (
        <form 
          onSubmit={handleShareStory} 
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', margin: '1rem 0' }}
        >
          <input 
            className="form-input" 
            type="text" 
            placeholder="Story title..." 
            value={newStoryTitle} 
            onChange={(e) => setNewStoryTitle(e.target.value)} 
          />
          <textarea
            className="form-input"
            rows="5"
            placeholder="Write your story here..."
            value={newStoryContent}
            onChange={(e) => setNewStoryContent(e.target.value)}
          />
          <button type="submit" className="form-button">Submit Story</button>
        </form>
      )}

      {stories.length === 0 ? (
        <p>No stories yet. Be the first to share one!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {stories.map((story, index) => (
            <li 
              key={story.id} 
              style={{ border: '1px solid #ddd', marginBottom: '1rem', padding: '1rem', borderRadius: '4px' }}
            >
              <h3>{story.title}</h3>
              <p>{story.content}</p>
              <p><strong>By:</strong> {story.postedBy} {timeAgo(story.postedAt)}</p>
              <p><strong>Likes:</strong> {story.likes}</p>
              {/* Add Like, Comment, and Share icons similar to AnswersPage later */}
              {/* Show comments if needed, but this is optional for MVP */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StoriesPage;

