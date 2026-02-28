// 📁 src/features/admin/api/propertiesApi.js

import apiClient from "../../../services/apiClient";

export const MOCK_MODE = true;

export const MOCK_PROPERTIES = [
  {
    id:         "p1",
    title:      "Marina View Tower - 3BR Apartment",
    location:   "Dubai Marina, Dubai",
    price:      "AED 2,500,000",
    beds:       3,
    baths:      3,
    area:       180,
    status:     "Active",
    media:      { photos: 5, docs: 1 },
    compliance: "Compliant",
    assignedTo: "Sarah Mitchell",
    type:       "Apartment",
  },
  {
    id:         "p2",
    title:      "Palm Jumeirah Villa",
    location:   "Palm Jumeirah, Dubai",
    price:      "AED 15,000,000",
    beds:       5,
    baths:      6,
    area:       650,
    status:     "Active",
    media:      { photos: 11, docs: 2 },
    compliance: "1 issue(s)",
    assignedTo: "Ahmed Khan",
    type:       "Villa",
  },
  {
    id:         "p3",
    title:      "Downtown Dubai Penthouse",
    location:   "Downtown Dubai",
    price:      "AED 25,000,000",
    beds:       4,
    baths:      5,
    area:       450,
    status:     "Draft",
    media:      { photos: 2, docs: 0 },
    compliance: "Compliant",
    assignedTo: null,
    type:       "Penthouse",
  },
  {
    id:         "p4",
    title:      "Business Bay Office Space",
    location:   "Business Bay, Dubai",
    price:      "AED 5,000,000",
    beds:       null,
    baths:      null,
    area:       300,
    status:     "Active",
    media:      { photos: 3, docs: 1 },
    compliance: "1 issue(s)",
    assignedTo: "John Davis",
    type:       "Commercial",
  },
  {
    id:         "p5",
    title:      "JBR Beach Apartment",
    location:   "JBR, Dubai",
    price:      "AED 3,200,000",
    beds:       2,
    baths:      2,
    area:       140,
    status:     "Archived",
    media:      { photos: 4, docs: 0 },
    compliance: "Compliant",
    assignedTo: null,
    type:       "Apartment",
  },
];

export const fetchProperties = async (params = {}) => {
  const { data } = await apiClient.get("/properties", { params });
  return data;
};