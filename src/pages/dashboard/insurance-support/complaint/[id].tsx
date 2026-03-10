import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const mockComplaints = [
  {
    id: "VINCA-INS-2026-0001",
    company: "HDFC Life",
    issueType: "Claim Rejected",
    status: "Registered",
    lastUpdated: "2026-03-05",
    policyNumber: "HL123456",
    policyType: "Life",
    policyHolder: "Amit Sharma",
    claimNumber: "CLM001",
    claimAmount: "500000",
    description: "Claim rejected due to missing documents. All documents were submitted on time.",
    files: [
      { name: "policy.pdf", size: 204800, date: "2026-03-01" },
      { name: "rejection-letter.pdf", size: 102400, date: "2026-03-05" }
    ],
    timeline: [
      { step: "Complaint Registered", date: "2026-03-05", status: "Completed" },
      { step: "Case Review by Vinca Team", date: "2026-03-06", status: "Completed" },
      { step: "Client Verification Call", date: "2026-03-06", status: "Completed" },
      { step: "Documents Submitted to Insurance Samadhan", date: "2026-03-07", status: "Completed" },
      { step: "Case Review by Insurance Samadhan", status: "In Progress" },
      { step: "Dispute Raised with Insurance Company", status: "Pending" },
      { step: "Escalation to Insurance Ombudsman", status: "Pending" },
      { step: "Resolution", status: "Pending" }
    ],
    messages: [
      { sender: "System", text: "Your case is under review.", date: "2026-03-06" },
      { sender: "Support", text: "Please upload missing documents.", date: "2026-03-07" }
    ]
  },
  // ...other mock complaints
];

const statusColors = {
  Registered: "bg-blue-100 text-blue-700",
  "Under Review": "bg-yellow-100 text-yellow-700",
  "Awaiting Documents": "bg-orange-100 text-orange-700",
  "Dispute Filed": "bg-purple-100 text-purple-700",
  "Ombudsman Escalation": "bg-red-100 text-red-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-700",
};

const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const complaint = mockComplaints.find(c => c.id === id);

  if (!complaint) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="text-red-600 mb-4">Complaint not found.</div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded font-semibold shadow hover:bg-blue-700 transition" onClick={() => navigate("/dashboard/insurance-support/complaints")}>Back to Complaints</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="font-mono text-xl mb-2">{complaint.id}</div>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[complaint.status] || "bg-gray-100 text-gray-700"}`}>{complaint.status}</span>
        </div>
        <div className="text-gray-500 text-sm">Submitted: {complaint.timeline[0]?.date} | Last Updated: {complaint.lastUpdated}</div>
      </div>
      {/* Timeline Component */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Progress Timeline</h3>
        <ul className="border-l-2 border-blue-200 pl-4">
          {complaint.timeline.map((step, idx) => (
            <li key={idx} className="mb-4 flex items-center">
              <span className={`mr-2 text-lg ${step.status === "Completed" ? "text-green-600" : step.status === "In Progress" ? "text-blue-600" : "text-gray-400"}`}>
                {step.status === "Completed" ? "✔️" : step.status === "In Progress" ? "⏳" : "⭕"}
              </span>
              <div>
                <div className="font-medium">{step.step}</div>
                {step.date && <div className="text-xs text-gray-500">{step.date}</div>}
                <div className="text-xs text-gray-400">{step.status}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* Case Details Card */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h3 className="font-semibold mb-2">Case Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><b>Insurance Company:</b> {complaint.company}</div>
          <div><b>Policy Number:</b> {complaint.policyNumber}</div>
          <div><b>Policy Type:</b> {complaint.policyType}</div>
          <div><b>Policy Holder:</b> {complaint.policyHolder}</div>
          <div><b>Claim Number:</b> {complaint.claimNumber}</div>
          <div><b>Claim Amount:</b> ₹{complaint.claimAmount}</div>
          <div><b>Issue Type:</b> {complaint.issueType}</div>
        </div>
        <div className="mt-4"><b>Description:</b> {complaint.description}</div>
      </div>
      {/* Documents Section */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h3 className="font-semibold mb-2">Documents</h3>
        {complaint.files.length === 0 ? (
          <div className="text-gray-500">No documents uploaded.</div>
        ) : (
          <ul>
            {complaint.files.map((file, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm mb-2">
                <span>{file.name}</span>
                <span className="text-gray-400">({Math.round(file.size / 1024)} KB)</span>
                <span className="text-gray-400">Uploaded: {file.date}</span>
                <button className="text-blue-600 underline">View</button>
              </li>
            ))}
          </ul>
        )}
        <button className="mt-2 bg-gray-200 px-4 py-2 rounded text-gray-700 hover:bg-gray-300 transition">Upload More Documents</button>
      </div>
      {/* Support Messages */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h3 className="font-semibold mb-2">Support Communication</h3>
        {complaint.messages.length === 0 ? (
          <div className="text-gray-500">No updates yet.</div>
        ) : (
          <ul>
            {complaint.messages.map((msg, idx) => (
              <li key={idx} className="mb-2">
                <span className="font-semibold mr-2">{msg.sender}:</span>
                <span>{msg.text}</span>
                <span className="text-xs text-gray-400 ml-2">{msg.date}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2 mt-2">
          <input type="text" placeholder="Type a message..." className="border rounded px-3 py-2 flex-1" disabled />
          <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-blue-700 transition" disabled>Send</button>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="bg-blue-600 text-white px-6 py-2 rounded font-semibold shadow hover:bg-blue-700 transition">Contact Support</button>
        <button className="bg-gray-200 px-4 py-2 rounded text-gray-700 hover:bg-gray-300 transition">Add Information</button>
        <button className="bg-red-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-red-700 transition">Close Complaint</button>
      </div>
    </div>
  );
};

export default ComplaintDetailPage;
