// Maps backend validation error paths (e.g. "body.location.address") to the flat
// form field keys used by the create/edit property forms, and buckets messages
// into per-field errors + a general fallback message.
//
// Shared by AddPropertyPage (nested JSON body) and EditPropertyModal (flat body).

export const FIELD_ALIAS = {
  "location.address": "address",
  "location.city": "city",
  "location.state": "state",
  "location.zipCode": "zipCode",
  "location.country": "country",
  "details.bedrooms": "bedrooms",
  "details.bathrooms": "bathrooms",
  "details.squareFeet": "squareFeet",
  "details.parking": "parking",
  "details.yearBuilt": "yearBuilt",
  "details.lotSize": "lotSize",
  "details.stories": "stories",
  "details.garage": "garage",
  featuredImage: "featured",
  gallery: "gallery",
  "contact.phone": "phone",
  "contact.whatsapp": "whatsapp",
  "contact.email": "email",
};

// Form fields that have a dedicated input that can be highlighted.
export const KNOWN_FIELDS = new Set([
  "title", "description", "type", "purpose", "rentFrequency", "price", "currency",
  "address", "city", "state", "zipCode", "country",
  "bedrooms", "bathrooms", "squareFeet", "parking", "yearBuilt", "lotSize", "stories", "garage",
  "featured", "gallery", "phone", "whatsapp", "email",
]);

// "body.location[0].address" / "body.location.address" → resolved form key.
export const normalizeFieldKey = (raw = "") => {
  const dotted = String(raw)
    .replace(/^body\./, "")
    .replace(/\[(\w+)\]/g, ".$1");
  if (FIELD_ALIAS[dotted]) return FIELD_ALIAS[dotted];
  // Fall back to the longest matching prefix (e.g. "featuredImage.url" → "featured").
  const parts = dotted.split(".");
  for (let i = parts.length; i > 0; i -= 1) {
    const prefix = parts.slice(0, i).join(".");
    if (FIELD_ALIAS[prefix]) return FIELD_ALIAS[prefix];
  }
  return parts[parts.length - 1];
};

// Given an axios error, returns:
//   fieldErrors    — { [formKey]: message } for inputs to highlight
//   generalMessage — banner text (joins unmapped messages / falls back)
//   hasFieldErrors — whether any field-level error was mapped
export const mapApiFieldErrors = (error) => {
  const details = error?.response?.data?.error?.details;
  const fieldErrors = {};
  const general = [];

  if (Array.isArray(details) && details.length) {
    details.forEach((item) => {
      const raw = item?.field ?? item?.path ?? item?.param ?? "";
      const msg = item?.message ?? item?.msg ?? "";
      if (!msg) return;
      const key = normalizeFieldKey(String(raw));
      if (KNOWN_FIELDS.has(key)) {
        if (!fieldErrors[key]) fieldErrors[key] = msg;
      } else {
        general.push(msg);
      }
    });
  } else {
    const errObj = error?.response?.data?.error;
    const msg =
      errObj?.message || error?.response?.data?.message || error?.message;
    if (msg) general.push(msg);
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const generalMessage = hasFieldErrors
    ? general.length
      ? `Please fix the highlighted fields. ${general.join(" ")}`
      : "Please fix the highlighted fields."
    : general.join(" ") || "Please review and fix the errors below.";

  return { fieldErrors, generalMessage, hasFieldErrors };
};
