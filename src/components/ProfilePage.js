import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid; // Use authenticated user's ID

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile || {});

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      const profileDoc = doc(db, "profiles", userId);
      const profileSnap = await getDoc(profileDoc);

      if (profileSnap.exists()) {
        const existingProfile = profileSnap.data();
        // If isAdmin isn't defined, default it to false
        if (existingProfile.isAdmin === undefined) {
          existingProfile.isAdmin = false;
        }
        setProfile(existingProfile);
        setFormData(existingProfile);
      } else {
        // No profile in Firestore yet, initialize an empty object
        const newProfile = { isAdmin: false };
        setProfile(newProfile);
        setFormData(newProfile);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // If it's a checkbox, use checked value; else normal text input
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    // Save the updated profile
    const profileDocRef = doc(db, "profiles", userId);
    await setDoc(profileDocRef, formData);

    setProfile(formData);
    setIsEditing(false);
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className='profile-container'>
      <h1 className='profile-header'>Your Profile</h1>
      <button 
        onClick={() => {
          if (!auth.currentUser) {
            alert("You must be logged in to edit your profile.");
            return;
          }
          setIsEditing(!isEditing)
        }}
        style={{marginBottom: 10, marginTop: 20}}>
        {isEditing ? "Cancel" : "Edit Profile"}
      </button>


      {!isEditing ? (
        <div className='profile-content'>
          <p>Name: {profile?.name || "N/A"}</p>
          <p>Job Role: {profile?.jobRole || "N/A"}</p>
          <p>Company: {profile?.company || "N/A"}</p>
          <p>Contact: {profile?.contact || "N/A"}</p>
          <p>Admin Access: {profile?.isAdmin ? "Yes" : "No"}</p>
          <img src={profile?.image || "/default-avatar.png"} alt="Profile" width="100" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '250px' }}>
          <input name="name" value={formData.name || ""} onChange={handleChange} placeholder="Name" />
          <input name="jobRole" value={formData.jobRole || ""} onChange={handleChange} placeholder="Job Role" />
          <input name="company" value={formData.company || ""} onChange={handleChange} placeholder="Company" />
          <input name="contact" value={formData.contact || ""} onChange={handleChange} placeholder="Contact" />
          {/* isAdmin as a checkbox */}
          {profile?.isAdmin && (
            <label>
              <input
                type="checkbox"
                name="isAdmin"
                checked={!!formData.isAdmin}
                onChange={handleChange}
              />
              Admin User?
            </label>
          )}
          <button type="submit">Save</button>
        </form>
      )}
    </div>
  );
  
};

export default ProfilePage;
