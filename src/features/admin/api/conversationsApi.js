// 📁 src/features/admin/api/conversationsApi.js

import apiClient from "../../../services/apiClient";

export const MOCK_MODE = true;

export const MOCK_CONVERSATIONS = [
  {
    id:       "conv_1",
    customer: { name: "Ravi K.",    phone: "+260971111111" },
    property: "Modern 2BR Apartment",
    lastMsg:  "Hello, I want a virtual tour. How can we arrange it?",
    time:     "30 days ago",
    status:   "Open",
    tags:     ["Unassigned", "Pending Agent"],
    agent:    null,
    messages: [
      { id: 1, sender: "customer", text: "Hello, I want a virtual tour. How can we arrange it?", time: "30 days ago" },
    ],
  },
  {
    id:       "conv_2",
    customer: { name: "Kunda M.",  phone: "+260973333333" },
    property: "Office Space – CBD",
    lastMsg:  "Great. What's the minimum lease term?",
    time:     "about 1 month ago",
    status:   "Open",
    tags:     ["Pending Agent"],
    agent:    null,
    messages: [
      { id: 1, sender: "customer", text: "Hi, I'm interested in the Office Space CBD listing.", time: "about 1 month ago" },
      { id: 2, sender: "agent",    text: "Hello Kunda! Great choice. What would you like to know?", time: "about 1 month ago" },
      { id: 3, sender: "customer", text: "Great. What's the minimum lease term?", time: "about 1 month ago" },
    ],
  },
  {
    id:       "conv_3",
    customer: { name: "Martha Z.", phone: "+260972222222" },
    property: "3BR Family Home",
    lastMsg:  "Yes, weekend works. Any slots on Saturday?",
    time:     "about 1 month ago",
    status:   "Open",
    tags:     ["Pending Agent"],
    agent:    "Agent Alice",
    messages: [
      { id: 1, sender: "customer", text: "I'd like to schedule a visit for the 3BR Family Home.", time: "about 1 month ago" },
      { id: 2, sender: "agent",    text: "Sure Martha! Are weekends convenient for you?", time: "about 1 month ago" },
      { id: 3, sender: "customer", text: "Yes, weekend works. Any slots on Saturday?", time: "about 1 month ago" },
    ],
  },
];

export const fetchConversations = async () => {
  const { data } = await apiClient.get("/conversations");
  return data;
};