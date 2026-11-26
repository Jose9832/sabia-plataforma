import type { Community, User } from '../../types';

export type ComunidadSalud = NonNullable<User['saludComunidad']>;

/* Respaldo sin conexión: misma configuración que guarda el servidor en communities.modulo_salud */
const MODULO_POR_COMUNIDAD: Record<string, ComunidadSalud> = {
  comm_sierra: 'indigena',
  comm_afro: 'afro',
  comm_campesinos: 'campesina',
  comm_pescadores: 'campesina',
  comm_palafitos: 'campesina'
};

/** Comunidad de salud de la persona: solo cuenta una membresía VERIFICADA por la custodia. */
export function comunidadDeSalud(user: User, communities: Community[]): ComunidadSalud | null {
  if (user.saludComunidad) return user.saludComunidad;
  for (const a of user.affiliations) {
    if (a.status !== 'verified' || a.role === 'none') continue;
    const modulo = communities.find(c => c.id === a.communityId)?.saludModulo || MODULO_POR_COMUNIDAD[a.communityId];
    if (modulo) return modulo;
  }
  return null;
}
