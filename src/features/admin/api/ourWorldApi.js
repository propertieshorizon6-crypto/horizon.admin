// 📁 src/features/admin/api/ourWorldApi.js

import apiClient from "../../../services/apiClient";
import { uploadViaPresign } from "./propertiesApi";

// GET /api/v1/admin/our-world
export const fetchOurWorldLogos = async () => {
  const { data } = await apiClient.get("/admin/our-world");
  return data?.data?.logos ?? [];
};

// POST /api/v1/admin/our-world — uploads the image to S3 first, then persists.
export const createOurWorld = async ({ body, imageFile }) => {
  if (!imageFile) throw new Error("Logo image is required");
  const image = await uploadViaPresign(imageFile, "logo");
  const { data } = await apiClient.post("/admin/our-world", { ...body, image });
  return data?.data?.logo;
};

// PATCH /api/v1/admin/our-world/:id — image optional (only re-uploads if changed).
export const editOurWorld = async (id, body = {}, imageFile = null) => {
  if (!id) return null;
  const payload = { ...body };
  if (imageFile) payload.image = await uploadViaPresign(imageFile, "logo");
  const { data } = await apiClient.patch(`/admin/our-world/${id}`, payload);
  return data?.data?.logo;
};

// DELETE /api/v1/admin/our-world/:id
export const deleteOurWorld = async (id) => {
  const { data } = await apiClient.delete(`/admin/our-world/${id}`);
  return data;
};
