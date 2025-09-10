
import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { getCurrentUser, getStatistics } from "../api";
import { Navigate } from "react-router-dom";

const ALLOWED_EMAILS = [
  "sangeetm@srmist.edu.in",
  "vadivukk@srmist.edu.in",
  "elavelvg@srmist.edu.in"
];


export default function StatisticsReport() {
  const reportRef = useRef();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(res => {
        setUser(res.data);
        if (res.data && ALLOWED_EMAILS.includes(res.data.email)) {
          getStatistics()
            .then(statRes => {
              setStats(statRes.data);
              setLoading(false);
            })
            .catch(() => {
              setError("Failed to fetch statistics.");
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!ALLOWED_EMAILS.includes(user.email)) return <div className="text-red-500 font-bold p-8">Access denied.</div>;

  const handleDownloadPDF = () => {
    if (!stats) return;
    const pdf = new jsPDF('p', 'mm', 'a4');
    let y = 15;
    pdf.setFontSize(18);
    pdf.text('Statistics Report', 15, y);
    y += 10;
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 15, y);
    y += 10;

    // Summary Table
    pdf.autoTable({
      startY: y,
      head: [['Metric', 'Count']],
      body: [
        ['Teachers', stats.teacherCount],
        ['Students', stats.studentCount],
        ['Projects', stats.projectCount],
        ['Applications', stats.applicationCount],
        ['Approved Groups', stats.groupCount],
        ['Approved Individuals', stats.individualCount],
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 184, 212] },
    });
    y = pdf.lastAutoTable.finalY + 10;

    // Teachers Who Uploaded Projects
    pdf.setFontSize(14);
    pdf.text('Teachers Who Uploaded Projects', 15, y);
    y += 4;
    pdf.autoTable({
      startY: y,
      head: [['Name', 'Email', 'Projects']],
      body: stats.teachersWithProjects.length === 0
        ? [['None', '', '']]
        : stats.teachersWithProjects.map(t => [t.name, t.email, t.projects.join(', ')]),
      theme: 'grid',
      headStyles: { fillColor: [0, 184, 212] },
    });
    y = pdf.lastAutoTable.finalY + 10;

    // Teachers Who Haven't Uploaded Projects
    pdf.setFontSize(14);
    pdf.text("Teachers Who Haven't Uploaded Projects", 15, y);
    y += 4;
    pdf.autoTable({
      startY: y,
      head: [['Name', 'Email']],
      body: stats.teachersWithoutProjects.length === 0
        ? [['None', '']]
        : stats.teachersWithoutProjects.map(t => [t.name, t.email]),
      theme: 'grid',
      headStyles: { fillColor: [0, 184, 212] },
    });
    y = pdf.lastAutoTable.finalY + 10;

    // Students Who Applied to Projects
    pdf.setFontSize(14);
    pdf.text('Students Who Applied to Projects', 15, y);
    y += 4;
    pdf.autoTable({
      startY: y,
      head: [['Name', 'Email', 'Reg No']],
      body: stats.studentsWithApplications.length === 0
        ? [['None', '', '']]
        : stats.studentsWithApplications.map(s => [s.name, s.email, s.regNo]),
      theme: 'grid',
      headStyles: { fillColor: [0, 184, 212] },
    });
    y = pdf.lastAutoTable.finalY + 10;

    // Students Who Haven't Applied to Projects
    pdf.setFontSize(14);
    pdf.text("Students Who Haven't Applied to Projects", 15, y);
    y += 4;
    pdf.autoTable({
      startY: y,
      head: [['Name', 'Email', 'Reg No']],
      body: stats.studentsWithoutApplications.length === 0
        ? [['None', '', '']]
        : stats.studentsWithoutApplications.map(s => [s.name, s.email, s.regNo]),
      theme: 'grid',
      headStyles: { fillColor: [0, 184, 212] },
    });
    y = pdf.lastAutoTable.finalY + 10;

    // Groups and Their Project Applications
    pdf.setFontSize(14);
    pdf.text('Groups and Their Project Applications', 15, y);
    y += 4;
    pdf.autoTable({
      startY: y,
      head: [['Project', 'Teacher', 'Students']],
      body: stats.groupDetails.length === 0
        ? [['None', '', '']]
        : stats.groupDetails.map(g => [g.projectTitle, g.teacherName, g.students.map(st => `${st.name} (${st.regNo})`).join(', ')]),
      theme: 'grid',
      headStyles: { fillColor: [0, 184, 212] },
      styles: { cellWidth: 'wrap' },
    });

    pdf.save('statistics-report.pdf');
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Statistics Report</h1>
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-cyan-700 text-white rounded-lg font-semibold shadow hover:bg-cyan-800 transition"
        >
          Download PDF
        </button>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div ref={reportRef}>
      {stats ? (
        <>
          <table className="w-full mb-8 border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-cyan-50">
              <tr>
                <th className="p-2 text-left">Metric</th>
                <th className="p-2 text-left">Count</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Teachers</td><td>{stats.teacherCount}</td></tr>
              <tr><td>Students</td><td>{stats.studentCount}</td></tr>
              <tr><td>Projects</td><td>{stats.projectCount}</td></tr>
              <tr><td>Applications</td><td>{stats.applicationCount}</td></tr>
              <tr><td>Approved Groups</td><td>{stats.groupCount}</td></tr>
              <tr><td>Approved Individuals</td><td>{stats.individualCount}</td></tr>
            </tbody>
          </table>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2 text-cyan-700">Teachers Who Uploaded Projects</h2>
            <table className="w-full border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-cyan-50">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Projects</th>
                </tr>
              </thead>
              <tbody>
                {stats.teachersWithProjects.length === 0 ? (
                  <tr><td colSpan={3} className="text-gray-500 p-2">None</td></tr>
                ) : stats.teachersWithProjects.map(t => (
                  <tr key={t.email}>
                    <td className="p-2">{t.name}</td>
                    <td className="p-2">{t.email}</td>
                    <td className="p-2">{t.projects.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2 text-cyan-700">Teachers Who Haven't Uploaded Projects</h2>
            <table className="w-full border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-cyan-50">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {stats.teachersWithoutProjects.length === 0 ? (
                  <tr><td colSpan={2} className="text-gray-500 p-2">None</td></tr>
                ) : stats.teachersWithoutProjects.map(t => (
                  <tr key={t.email}>
                    <td className="p-2">{t.name}</td>
                    <td className="p-2">{t.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2 text-cyan-700">Students Who Applied to Projects</h2>
            <table className="w-full border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-cyan-50">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Reg No</th>
                </tr>
              </thead>
              <tbody>
                {stats.studentsWithApplications.length === 0 ? (
                  <tr><td colSpan={3} className="text-gray-500 p-2">None</td></tr>
                ) : stats.studentsWithApplications.map(s => (
                  <tr key={s.email}>
                    <td className="p-2">{s.name}</td>
                    <td className="p-2">{s.email}</td>
                    <td className="p-2">{s.regNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2 text-cyan-700">Students Who Haven't Applied to Projects</h2>
            <table className="w-full border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-cyan-50">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Reg No</th>
                </tr>
              </thead>
              <tbody>
                {stats.studentsWithoutApplications.length === 0 ? (
                  <tr><td colSpan={3} className="text-gray-500 p-2">None</td></tr>
                ) : stats.studentsWithoutApplications.map(s => (
                  <tr key={s.email}>
                    <td className="p-2">{s.name}</td>
                    <td className="p-2">{s.email}</td>
                    <td className="p-2">{s.regNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2 text-cyan-700">Groups and Their Project Applications</h2>
            <table className="w-full border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-cyan-50">
                <tr>
                  <th className="p-2 text-left">Project</th>
                  <th className="p-2 text-left">Teacher</th>
                  <th className="p-2 text-left">Students</th>
                </tr>
              </thead>
              <tbody>
                {stats.groupDetails.length === 0 ? (
                  <tr><td colSpan={3} className="text-gray-500 p-2">None</td></tr>
                ) : stats.groupDetails.map((g, idx) => (
                  <tr key={idx}>
                    <td className="p-2">{g.projectTitle}</td>
                    <td className="p-2">{g.teacherName}</td>
                    <td className="p-2">{g.students.map(st => `${st.name} (${st.regNo})`).join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div>No statistics available.</div>
      )}
      </div>
    </div>
  );
}
