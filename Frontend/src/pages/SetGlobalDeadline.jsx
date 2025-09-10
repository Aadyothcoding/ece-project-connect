// src/pages/SetGlobalDeadline.jsx
import { useState, useEffect } from "react";
import { getGlobalDeadline, setGlobalDeadline } from "../api";

export default function SetGlobalDeadline({ user }) {
  const [deadline, setDeadline] = useState("");
  const [current, setCurrent] = useState("");
  const [message, setMessage] = useState("");
  const allowedEmails = [
    "sangeetm@srmist.edu.in",
    "vadivukk@srmist.edu.in",
    "elavelvg@srmist.edu.in"
  ];

  useEffect(() => {
    getGlobalDeadline().then(res => {
      setCurrent(res.data.deadline ? new Date(res.data.deadline).toISOString().split("T")[0] : "");
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await setGlobalDeadline(deadline);
      setMessage("Deadline updated successfully!");
      setCurrent(deadline);
    } catch {
      setMessage("Failed to update deadline.");
    }
  };

  if (!allowedEmails.includes(user?.email)) {
    return <div className="p-8 text-center text-red-500">Not authorized.</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-lg border border-slate-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Set Global Application Deadline</h2>
      {message && <p className="mb-4 text-green-600 text-center">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Current Deadline</label>
          <div className="w-full mt-1 px-4 py-2 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg">{current || "No deadline set"}</div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">New Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="w-full mt-1 px-4 py-2 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            required
          />
        </div>
        <button type="submit" className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition">Update Deadline</button>
      </form>
    </div>
  );
}
