import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const formatIssueType = (type: string): string => {
  if (!type) return "";
  return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const loadComplaints = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('insurance-complaints') || '[]');
    return stored.map((c: any) => ({
      id: c.id,
      company: c.insurer,
      issueType: formatIssueType(c.issueType),
      status: c.status,
      lastUpdated: c.lastUpdated,
    }));
  } catch {
    return [];
  }
};

const statusColors = {
  Registered: "bg-blue-100 text-blue-700",
  "Under Review": "bg-yellow-100 text-yellow-700",
  "Awaiting Documents": "bg-orange-100 text-orange-700",
  "Dispute Filed": "bg-purple-100 text-purple-700",
  "Ombudsman Escalation": "bg-red-100 text-red-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-700",
};

const ComplaintListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const complaints = loadComplaints();

  const filtered = complaints.filter(c => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusTabs = ["All", "Registered", "Under Review", "Resolved", "Closed", "Dispute Filed"];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Complaints</h2>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by ID or Insurance Company"
          className="border rounded px-3 py-2 w-64"
        />
        <div className="flex gap-2">
          {statusTabs.map(tab => (
            <button
              key={tab}
              className={`px-3 py-1 rounded font-semibold text-sm ${statusFilter === tab ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
              onClick={() => setStatusFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-gray-500 text-center mt-8">
          <div className="mb-2">No complaints found.</div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded font-semibold shadow hover:bg-blue-700 transition" onClick={() => navigate("/dashboard/insurance-support/new/type")}>Raise First Complaint</button>
        </div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2">Complaint ID</th>
              <th>Insurance Company</th>
              <th>Issue Type</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b last:border-none">
                <td className="py-2 font-mono text-sm">{c.id}</td>
                <td>{c.company}</td>
                <td>{c.issueType}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[c.status] || "bg-gray-100 text-gray-700"}`}>{c.status}</span>
                </td>
                <td>{c.lastUpdated}</td>
                <td>
                  <button className="text-blue-600 underline" onClick={() => navigate(`/dashboard/insurance-support/complaint/${c.id}`)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ComplaintListPage;
