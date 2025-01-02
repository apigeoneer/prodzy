import React, { useState, useEffect } from 'react';
import { getStories } from '../services/dataService';
import { timeAgo } from '../utils/formatTime'; // if using relative times
import { collection, addDoc} from 'firebase/firestore';
import { db } from '../firebase';
import {
  MIN_TITLE_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  STORY_PREVIEW_LIMIT
} from '../utils/constants';

const StoriesPage = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryContent, setNewStoryContent] = useState("");

  // Track which stories are expanded
  const [expandedStories, setExpandedStories] = useState({}); // e.g. { storyId1: true, storyId2: false }
  // Toggle function for "Read More"/"Read Less"
  const toggleStoryExpand = (storyId) => {
    setExpandedStories((prev) => ({
      ...prev,
      [storyId]: !prev[storyId],
    }));
  };

  // Fetch stories on mount
  useEffect(() => {
    setLoading(true);
    getStories().then((data) => {
      // Add any default fields if needed
      const processed = data.map((story) => ({
        ...story,
        comments: story.comments || [],
        likedByUser: story.likedByUser || false,
      }));
      setStories(processed);
      setLoading(false);
    });
  }, []);

  // Add a new story to Firestore
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
      likedByUser: false,
    };

    await addDoc(collection(db, "stories"), newStory);

    // Re-fetch stories
    const updatedStories = await getStories();
    setStories(updatedStories);

    setNewStoryTitle("");
    setNewStoryContent("");
    setShowStoryForm(false);

    if (newStoryTitle.length < MIN_TITLE_LENGTH) {
      alert(`Story title must be at least ${MIN_TITLE_LENGTH} characters.`);
      return;
    }
    if (newStoryTitle.length > MAX_TITLE_LENGTH) {
      alert(`Story title cannot exceed ${MAX_TITLE_LENGTH} characters.`);
      return;
    }
    if (newStoryContent.length < MIN_DESCRIPTION_LENGTH) {
      alert(`Story title must be at least ${MIN_DESCRIPTION_LENGTH} characters.`);
      return;
    }
    if (newStoryContent.length > MAX_DESCRIPTION_LENGTH) {
      alert(`Story title cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`);
      return;
    }
  };

  // Demo function that doesn't persist to Firestore (optional)
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
      likedByUser: false,
    };

    // This only updates local state, not Firestore
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
          onSubmit={handleSubmitStory}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            maxWidth: "500px",
            margin: "1rem 0",
          }}
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
          <button type="submit" className="form-button">
            Submit Story
          </button>
        </form>
      )}

      {stories.length === 0 ? (
        <p>No stories yet. Be the first to share one!</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {stories.map((story) => {
            // Check if the story is longer than the limit
            const isLong = story.content.length > STORY_PREVIEW_LIMIT;
            // Check if it's expanded based on story's ID
            const expanded = expandedStories[story.id];
            // If it's long and not expanded, show partial content
            const displayedContent =
              isLong && !expanded
                ? story.content.substring(0, STORY_PREVIEW_LIMIT) + "…"
                : story.content;

            return (
              <li
                key={story.id}
                style={{
                  border: "1px solid #ddd",
                  marginBottom: "1rem",
                  padding: "1rem",
                  borderRadius: "4px",
                }}
              >
                <h3>{story.title}</h3>
                <p>{displayedContent}</p>
                <p>
                  <strong>By:</strong> {story.postedBy} {timeAgo(story.postedAt)}
                </p>
                {/* <p>
                  <strong>Likes:</strong> {story.likes}
                </p> */}
                {isLong && (
                  <button
                    onClick={() => toggleStoryExpand(story.id)}
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default StoriesPage;
