// import apiClient from "../../../services/apiClient";

// export const getDashboardData = async () => {
//   const res = await apiClient.get("/admin/analytics/overview");
//   return res.data.data;
// };


export const getDashboardData = async () => {
  return {
    stats: [
      { label: "New Leads Today", value: 47, growth: 12 },
      { label: "Inquiries Today", value: 128, growth: 8 },
      { label: "Tour Requests", value: 23, growth: -3 },
      { label: "Calls Today", value: 34, growth: 15 },
      { label: "Messages Today", value: 89, growth: 22 },
    ],
    leadsSource: [
      { day: "Mon", website: 20, app: 10 },
      { day: "Tue", website: 25, app: 15 },
      { day: "Wed", website: 30, app: 12 },
      { day: "Thu", website: 40, app: 20 },
      { day: "Fri", website: 45, app: 30 },
    ],
    leadsStatus: [
      { name: "New", value: 120 },
      { name: "Assigned", value: 90 },
      { name: "Closed", value: 60 },
    ],
    agentLoad: [
      { name: "John", leads: 28 },
      { name: "Sarah", leads: 20 },
      { name: "Mike", leads: 15 },
    ],
    liveAlerts: [],
    queue: [],
  };
};