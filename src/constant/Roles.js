// src/constants/roles.js
export const ROLES = {
  ADMIN: "admin",
  OWNER: "propietario_negocio",
  PROVIDER: "prestador_servicios",
};

// Aliases de compatibilidad (por si en algún lado quedó legacy)
export const LegacyRoleMap = {
  Prestador_de_servicios: ROLES.PROVIDER,
  Prestador_servicios: ROLES.PROVIDER,
  prestador_servicios: ROLES.PROVIDER,
  propietario_negocio: ROLES.OWNER,
  admin: ROLES.ADMIN,
};

/** Normaliza cualquier string de rol a nuestro set oficial */
export const normalizeRole = (r) => {
  if (!r) return "";
  const raw = String(r).trim();
  if (LegacyRoleMap[raw]) return LegacyRoleMap[raw];
  return raw.toLowerCase().replace(/\s+/g, "_");
};
