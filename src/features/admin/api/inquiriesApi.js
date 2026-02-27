// 📁 src/features/admin/api/inquiriesApi.js

import apiClient from "../../../services/apiClient";

export const MOCK_MODE = true;

export const MOCK_INQUIRIES = [
  {
    id:         "INQ-001",
    createdAt:  new Date(Date.now() - 2  * 60 * 60 * 1000),
    source:     "Website",
    property:   "Marina View Tower - 3BR",
    customer:   { name: "John Smith",    email: "john@email.com"    },
    agent:      "Sarah Mitchell",
    status:     "Open",
    sla:        { label: "2h left",  urgent: true  },
  },
  {
    id:         "INQ-002",
    createdAt:  new Date(Date.now() - 5  * 60 * 60 * 1000),
    source:     "App",
    property:   "Palm Jumeirah Villa",
    customer:   { name: "Emma Wilson",   email: "emma@company.com"  },
    agent:      "John Davis",
    status:     "In Progress",
    sla:        { label: "5h left",  urgent: false },
  },
  {
    id:         "INQ-003",
    createdAt:  new Date(Date.now() - 8  * 60 * 60 * 1000),
    source:     "Whatsapp",
    property:   "Downtown Dubai Penthouse",
    customer:   { name: "Ahmed Hassan",  email: null                },
    agent:      null,
    status:     "Pending",
    sla:        { label: "Overdue", urgent: true  },
  },
  {
    id:         "INQ-004",
    createdAt:  new Date(Date.now() - 1  * 24 * 60 * 60 * 1000),
    source:     "Call",
    property:   "JBR Beach Apartment",
    customer:   { name: "Lisa Chen",     email: "lisa@email.com"    },
    agent:      "Ahmed Khan",
    status:     "Resolved",
    sla:        { label: "Done",    urgent: false },
  },
  {
    id:         "INQ-005",
    createdAt:  new Date(Date.now() - 2  * 24 * 60 * 60 * 1000),
    source:     "Website",
    property:   "Business Bay Office",
    customer:   { name: "Michael Brown", email: "michael@email.com" },
    agent:      "Sarah Mitchell",
    status:     "Closed",
    sla:        { label: "Done",    urgent: false },
  },
  {
    id:         "INQ-006",
    createdAt:  new Date(Date.now() - 3  * 60 * 60 * 1000),
    source:     "App",
    property:   "Jumeirah Golf Estate 4BR",
    customer:   { name: "Priya Mehta",   email: "priya@email.com"   },
    agent:      null,
    status:     "Open",
    sla:        { label: "4h left",  urgent: false },
  },
];

export const fetchInquiries = async (params = {}) => {
  const { data } = await apiClient.get("/inquiries", { params });
  return data;
};