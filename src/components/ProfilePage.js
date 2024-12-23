import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid; // Use authenticated user's ID

  const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState(profile || {});

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const profileDocRef = doc(db, "profiles", userId);
  await setDoc(profileDocRef, formData); // Save to Firestore
  setProfile(formData);
  setIsEditing(false);
};

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      const profileDoc = doc(db, "profiles", userId);
      const profileSnap = await getDoc(profileDoc);

      if (profileSnap.exists()) {
        setProfile(profileSnap.data());
      } else {
        setProfile({}); // Initialize empty profile
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  if (loading) return <p>Loading profile...</p>;

  return (
    <div>
      <h1>Your Profile</h1>
      <button onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? "Cancel" : "Edit Profile"}
      </button>
      {!isEditing ? (
        <div>
          <p>Name: {profile?.name || "N/A"}</p>
          <p>Job Role: {profile?.jobRole || "N/A"}</p>
          <p>Company: {profile?.company || "N/A"}</p>
          <p>Contact: {profile?.contact || "N/A"}</p>
          <img src={profile?.image || "/default-avatar.png"} alt="Profile" width="100" />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input name="name" value={formData.name || ""} onChange={handleChange} placeholder="Name" />
          <input name="jobRole" value={formData.jobRole || ""} onChange={handleChange} placeholder="Job Role" />
          <input name="company" value={formData.company || ""} onChange={handleChange} placeholder="Company" />
          <input name="contact" value={formData.contact || ""} onChange={handleChange} placeholder="Contact" />
          <button type="submit">Save</button>
        </form>
      )}
    </div>
  );
  
};

export default ProfilePage;
