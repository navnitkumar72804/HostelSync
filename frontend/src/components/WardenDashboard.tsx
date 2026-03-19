// import React, { useState } from "react";
// import { Calendar, User, MapPin, AlertCircle } from "lucide-react";

// interface Feedback {
//   rating: number;
//   comment: string;
// }

// interface Complaint {
//   id: string;
//   title: string;
//   category: string;
//   description: string;
//   studentName: string;
//   hostelBlock: string;
//   roomNumber: string;
//   dateCreated: string;
//   status: "Pending" | "In Progress" | "Resolved";
//   priority: "Low" | "Medium" | "High";
//   feedback?: Feedback;
// }

// interface WardenComplaintCardProps {
//   complaint: Complaint;
//   onStatusUpdate: (id: string, status: string) => void;
//   onDelete: (id: string) => void;
// }

// const WardenComplaintCard: React.FC<WardenComplaintCardProps> = ({
//   complaint,
//   onStatusUpdate,
//   onDelete,
// }) => {
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "Pending":
//         return "bg-yellow-100 text-yellow-800";
//       case "In Progress":
//         return "bg-blue-100 text-blue-800";
//       case "Resolved":
//         return "bg-green-100 text-green-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case "High":
//         return "text-red-600";
//       case "Medium":
//         return "text-yellow-600";
//       case "Low":
//         return "text-green-600";
//       default:
//         return "text-gray-600";
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
//       <div className="flex justify-between items-start mb-4">
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-1">
//             {complaint.title}
//           </h3>
//           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//             {complaint.category}
//           </span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <span
//             className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
//               complaint.status
//             )}`}
//           >
//             {complaint.status}
//           </span>
//           <div className={`flex items-center ${getPriorityColor(complaint.priority)}`}>
//             <AlertCircle className="w-4 h-4 mr-1" />
//             <span className="text-xs font-medium">{complaint.priority}</span>
//           </div>
//         </div>
//       </div>

//       <p className="text-gray-600 mb-4">{complaint.description}</p>

//       <div className="flex flex-wrap items-center text-sm text-gray-500 space-x-4 mb-4">
//         <div className="flex items-center">
//           <User className="w-4 h-4 mr-1" />
//           <span>{complaint.studentName}</span>
//         </div>
//         <div className="flex items-center">
//           <MapPin className="w-4 h-4 mr-1" />
//           <span>
//             {complaint.hostelBlock} - Room {complaint.roomNumber}
//           </span>
//         </div>
//         <div className="flex items-center">
//           <Calendar className="w-4 h-4 mr-1" />
//           <span>{complaint.dateCreated}</span>
//         </div>
//       </div>

//       {/* Warden Actions */}
//       <div className="flex justify-between items-center pt-4 border-t border-gray-200">
//         <select
//           value={complaint.status}
//           onChange={(e) => onStatusUpdate(complaint.id, e.target.value)}
//           className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="Pending">Pending</option>
//           <option value="In Progress">In Progress</option>
//           <option value="Resolved">Resolved</option>
//         </select>
//         <button
//           onClick={() => onDelete(complaint.id)}
//           className="px-4 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-md transition-colors"
//         >
//           Delete
//         </button>
//       </div>

//       {/* Feedback Section - Only show if feedback exists */}
//       {complaint.feedback && (
//         <div className="mt-4 pt-4 border-t border-gray-200">
//           <div className="bg-green-50 p-4 rounded-lg">
//             <h4 className="text-sm font-semibold text-gray-900 mb-2">
//               Student Feedback
//             </h4>
//             <div className="flex items-center mb-2">
//               <span className="text-yellow-500 text-xl">
//                 {"★".repeat(complaint.feedback.rating)}
//                 <span className="text-gray-300">
//                   {"★".repeat(5 - complaint.feedback.rating)}
//                 </span>
//               </span>
//               <span className="ml-2 text-sm font-medium text-gray-700">
//                 ({complaint.feedback.rating}/5)
//               </span>
//             </div>
//             <p className="text-gray-700 text-sm italic">"{complaint.feedback.comment}"</p>
//             <p className="text-xs text-gray-500 mt-2">
//               Feedback from {complaint.studentName}
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Warden Dashboard
// const WardenDashboard = () => {
//   const [complaints, setComplaints] = useState<Complaint[]>([
//     {
//       id: "1",
//       title: "Broken Water Heater",
//       category: "Maintenance",
//       description: "The water heater in my room has stopped working. No hot water for the past 2 days.",
//       studentName: "John Doe",
//       hostelBlock: "Block A",
//       roomNumber: "201",
//       dateCreated: "2024-10-01",
//       status: "Resolved",
//       priority: "High",
//       feedback: {
//         rating: 5,
//         comment: "Very satisfied with the quick resolution. The maintenance team was professional and fixed the issue within a day!"
//       }
//     },
//     {
//       id: "2",
//       title: "Ceiling Fan Not Working",
//       category: "Electrical",
//       description: "The ceiling fan in my room doesn't turn on. Need urgent repair.",
//       studentName: "Jane Smith",
//       hostelBlock: "Block B",
//       roomNumber: "305",
//       dateCreated: "2024-10-03",
//       status: "In Progress",
//       priority: "Medium"
//     },
//     {
//       id: "3",
//       title: "WiFi Connection Issues",
//       category: "Internet",
//       description: "Frequent WiFi disconnections in my room. Very slow speed.",
//       studentName: "Mike Johnson",
//       hostelBlock: "Block C",
//       roomNumber: "102",
//       dateCreated: "2024-10-04",
//       status: "Pending",
//       priority: "Low"
//     },
//     {
//       id: "4",
//       title: "Leaking Pipe",
//       category: "Plumbing",
//       description: "There is a water leak from the bathroom pipe. Water is spreading to the room.",
//       studentName: "Sarah Williams",
//       hostelBlock: "Block A",
//       roomNumber: "150",
//       dateCreated: "2024-09-28",
//       status: "Resolved",
//       priority: "High",
//       feedback: {
//         rating: 4,
//         comment: "Good service. The plumber fixed the leak, but took 2 days to resolve."
//       }
//     }
//   ]);

//   const [filter, setFilter] = useState<"All" | "Pending" | "In Progress" | "Resolved">("All");

//   const handleStatusUpdate = (id: string, status: string) => {
//     setComplaints(complaints.map(c => 
//       c.id === id ? { ...c, status: status as "Pending" | "In Progress" | "Resolved" } : c
//     ));
//   };

//   const handleDelete = (id: string) => {
//     setComplaints(complaints.filter(c => c.id !== id));
//   };

//   const filteredComplaints = filter === "All" 
//     ? complaints 
//     : complaints.filter(c => c.status === filter);

//   const stats = {
//     total: complaints.length,
//     pending: complaints.filter(c => c.status === "Pending").length,
//     inProgress: complaints.filter(c => c.status === "In Progress").length,
//     resolved: complaints.filter(c => c.status === "Resolved").length,
//     withFeedback: complaints.filter(c => c.feedback).length
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Warden Dashboard</h1>
//           <p className="text-gray-600">Manage and resolve student complaints</p>
//         </div>

//         {/* Statistics */}
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
//           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//             <p className="text-sm text-gray-600 mb-1">Total Complaints</p>
//             <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//             <p className="text-sm text-gray-600 mb-1">Pending</p>
//             <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//             <p className="text-sm text-gray-600 mb-1">In Progress</p>
//             <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//             <p className="text-sm text-gray-600 mb-1">Resolved</p>
//             <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//             <p className="text-sm text-gray-600 mb-1">With Feedback</p>
//             <p className="text-2xl font-bold text-purple-600">{stats.withFeedback}</p>
//           </div>
//         </div>

//         {/* Filter Buttons */}
//         <div className="mb-6 flex items-center space-x-2">
//           <span className="text-sm font-medium text-gray-700">Filter:</span>
//           {["All", "Pending", "In Progress", "Resolved"].map((status) => (
//             <button
//               key={status}
//               onClick={() => setFilter(status as any)}
//               className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
//                 filter === status
//                   ? "bg-blue-600 text-white"
//                   : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
//               }`}
//             >
//               {status}
//             </button>
//           ))}
//         </div>

//         {/* Complaints List */}
//         <div className="space-y-4">
//           {filteredComplaints.length > 0 ? (
//             filteredComplaints.map((complaint) => (
//               <WardenComplaintCard
//                 key={complaint.id}
//                 complaint={complaint}
//                 onStatusUpdate={handleStatusUpdate}
//                 onDelete={handleDelete}
//               />
//             ))
//           ) : (
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
//               <p className="text-gray-500">No complaints found for the selected filter.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WardenDashboard;