// 📁 src/features/admin/api/usersApi.js

import apiClient from "../../../services/apiClient";

export const MOCK_MODE = true;

export const MOCK_USERS = [
  {
    id:           "u1",
    name:         "Sarah Mitchell",
    email:        "sarah@horizon.ae",
    initials:     "SM",
    role:         "Agent",
    manager:      "David Lee",
    territories:  ["Dubai Marina", "JBR"],
    activeLeads:  28,
    status:       "Active",
    lastLogin:    "1h ago",
  },
  {
    id:           "u2",
    name:         "Ahmed Khan",
    email:        "ahmed@horizon.ae",
    initials:     "AK",
    role:         "Agent",
    manager:      "David Lee",
    territories:  ["Palm Jumeirah", "Downtown"],
    activeLeads:  22,
    status:       "Active",
    lastLogin:    "1h ago",
  },
  {
    id:           "u3",
    name:         "David Lee",
    email:        "david@horizon.ae",
    initials:     "DL",
    role:         "Manager",
    manager:      null,
    territories:  ["Dubai"],
    activeLeads:  null,
    status:       "Active",
    lastLogin:    "1h ago",
  },
  {
    id:           "u4",
    name:         "John Davis",
    email:        "john@horizon.ae",
    initials:     "JD",
    role:         "Agent",
    manager:      "David Lee",
    territories:  ["Business Bay", "DIFC"],
    activeLeads:  16,
    status:       "Active",
    lastLogin:    "2h ago",
  },
  {
    id:           "u5",
    name:         "Lisa Roberts",
    email:        "lisa@horizon.ae",
    initials:     "LR",
    role:         "Agent",
    manager:      null,
    territories:  ["Springs", "Meadows"],
    activeLeads:  0,
    status:       "Inactive",
    lastLogin:    "Never",
  },
  {
    id:           "u6",
    name:         "Admin User",
    email:        "admin@horizon.ae",
    initials:     "AU",
    role:         "Admin",
    manager:      null,
    territories:  [],
    activeLeads:  null,
    status:       "Active",
    lastLogin:    "52m ago",
  },
];

export const fetchUsers = async () => {
  const { data } = await apiClient.get("/users");
  return data;
};