// 📁 src/features/admin/api/leadsApi.js

import apiClient from "../../../services/apiClient";

export const MOCK_MODE = true;

export const MOCK_LEADS = [
  {
    id:        1,
    name:      "John Smith",
    email:     "john@email.com",
    phone:     "+971501234567",
    property:  "Marina View Tower - 3BR Apar...",
    source:    "Website",
    intent:    "Inquiry",
    status:    "New",
    priority:  "High",
    assignedTo: null,
    createdAt: new Date(Date.now() - 5  * 60 * 60 * 1000),
  },
  {
    id:        2,
    name:      "Emma Wilson",
    email:     "emma@company.com",
    phone:     null,
    property:  "Palm Jumeirah Villa",
    source:    "App",
    intent:    "Tour",
    status:    "Assigned",
    priority:  "Medium",
    assignedTo: "Sarah Mitchell",
    createdAt: new Date(Date.now() - 7  * 60 * 60 * 1000),
  },
  {
    id:        3,
    name:      "Ahmed Hassan",
    email:     null,
    phone:     "+971507654321",
    property:  "Downtown Dubai Penthouse",
    source:    "Call",
    intent:    "Call",
    status:    "In Progress",
    priority:  "High",
    assignedTo: "John Davis",
    createdAt: new Date(Date.now() - 9  * 60 * 60 * 1000),
  },
  {
    id:        4,
    name:      "Lisa Chen",
    email:     "lisa@email.com",
    phone:     "+971509876543",
    property:  "JBR Beach Apartment",
    source:    "Whatsapp",
    intent:    "Message",
    status:    "New",
    priority:  "Low",
    assignedTo: null,
    createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000),
  },
  {
    id:        5,
    name:      "Michael Brown",
    email:     "michael@email.com",
    phone:     null,
    property:  "Business Bay Office",
    source:    "Website",
    intent:    "Inquiry",
    status:    "Closed",
    priority:  "Medium",
    assignedTo: "Ahmed Khan",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id:        6,
    name:      "Priya Mehta",
    email:     "priya@email.com",
    phone:     "+971501112233",
    property:  "Jumeirah Golf Estate 4BR",
    source:    "App",
    intent:    "Tour",
    status:    "Assigned",
    priority:  "High",
    assignedTo: "Sarah Mitchell",
    createdAt: new Date(Date.now() - 2  * 24 * 60 * 60 * 1000),
  },
  {
    id:        7,
    name:      "Rahul Sharma",
    email:     "rahul@email.com",
    phone:     "+971509988776",
    property:  "Andheri West 3BHK",
    source:    "Website",
    intent:    "Inquiry",
    status:    "Archived",
    priority:  "Low",
    assignedTo: null,
    createdAt: new Date(Date.now() - 5  * 24 * 60 * 60 * 1000),
  },
];

export const fetchLeads = async (params = {}) => {
  const { data } = await apiClient.get("/leads", { params });
  return data;
};