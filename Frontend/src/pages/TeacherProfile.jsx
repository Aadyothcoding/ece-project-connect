// frontend/src/pages/TeacherProfile.jsx
import React, { useEffect, useState } from "react";
import { getCurrentUser, updateProfile } from "../api";

export default function TeacherProfile() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    profilePic: "",
    department: "",
    skills: "",
    resumeUrl: "",
    experience: "",
    description: "",
    researchPast: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res.data.role !== "teacher") {
          window.location.href = "/student-dashboard"; // redirect wrong role
        } else {
          setProfile(res.data);
          setLoading(false);
        }
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(profile).then(() => {
      alert("Profile updated successfully!");
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Teacher Profile</h1>

      <div>
        {profile.profilePic && (
          <img
            src={profile.profilePic}
            alt="Profile"
            style={{ width: "120px", borderRadius: "50%", marginBottom: "10px" }}
          />
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
        <label>Full Name</label>
        <input
          type="text"
          name="fullName"
          value={profile.fullName || ""}
          onChange={handleChange}
          disabled
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={profile.email || ""}
          disabled
        />

        <label>Profile Picture URL</label>
        <input
          type="text"
          name="profilePic"
          value={profile.profilePic || ""}
          onChange={handleChange}
        />

        <label>Department</label>
        <input
          type="text"
          name="department"
          value={profile.department || ""}
          onChange={handleChange}
        />

        <label>Skills (comma-separated)</label>
        <input
          type="text"
          name="skills"
          value={profile.skills || ""}
          onChange={handleChange}
        />

        <label>Resume URL</label>
        <input
          type="text"
          name="resumeUrl"
          value={profile.resumeUrl || ""}
          onChange={handleChange}
        />

        <label>Experience</label>
        <input
          type="text"
          name="experience"
          value={profile.experience || ""}
          onChange={handleChange}
        />

        <label>Description</label>
        <textarea
          name="description"
          value={profile.description || ""}
          onChange={handleChange}
        />

        <label>Research Past</label>
        <textarea
          name="researchPast"
          value={profile.researchPast || ""}
          onChange={handleChange}
        />

        <button type="submit" style={{ marginTop: "10px" }}>
          Save Changes
        </button>
      </form>
    </div>
  );
}
