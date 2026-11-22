import type { 
  User, 
  KnowledgeItem, 
  AILabArtifact, 
  AiOperation, 
  AiOperationPermission,
  CeibaQueryResponse
} from '../types/index.ts';

/**
 * Checks if a user has a VERIFIED membership in a specific community.
 * Pending, rejected, or revoked memberships return false.
 */
export function isUserVerifiedMemberOfCommunity(user: User, communityId: string): boolean {
  if (!user || !Array.isArray(user.affiliations)) return false;
  return user.affiliations.some(
    a => a.communityId === communityId && a.status === 'verified' && a.role !== 'none'
  );
}

/**
 * Checks if a user is a VERIFIED CUSTODIAN of a specific community.
 * Never relies on a global "custodian" role without checking the specific communityId.
 */
export function isUserCustodianOfCommunity(user: User, communityId: string): boolean {
  if (!user || !Array.isArray(user.affiliations)) return false;
  return user.affiliations.some(
    a => a.communityId === communityId && a.status === 'verified' && a.role === 'custodian'
  );
}

/**
 * Returns the list of community IDs where the user holds verified custodian authority.
 */
export function getCustodianCommunityIds(user: User): string[] {
  if (!user || !Array.isArray(user.affiliations)) return [];
  return user.affiliations
    .filter(a => a.status === 'verified' && a.role === 'custodian')
    .map(a => a.communityId);
}

/**
 * P0.2: Central selector to check if a custodian has authority to review a resource
 * (KnowledgeItem, AILabArtifact, AccessRequest, AffiliationRequest).
 * Requires verified custodian membership in at least one of the resource's owner communities.
 */
export function canCustodianReviewResource(
  user: User,
  resource: { communityIds?: string[]; communityId?: string }
): boolean {
  const custodianCommIds = getCustodianCommunityIds(user);
  if (custodianCommIds.length === 0) return false;

  const targetCommIds = resource.communityIds 
    ? resource.communityIds 
    : resource.communityId 
    ? [resource.communityId] 
    : [];

  if (targetCommIds.length === 0) return false;

  return targetCommIds.some(cId => custodianCommIds.includes(cId));
}

/**
 * P0.5: A multi-community knowledge item is ONLY considered unanimously approved
 * when EVERY owner community in `communityIds` has an 'approved' entry in `approvals`.
 */
export function hasUnanimousOwnerApproval(
  knowledge: Pick<KnowledgeItem, 'communityIds' | 'approvals'>
): boolean {
  if (!knowledge.communityIds || knowledge.communityIds.length === 0) return false;
  if (!knowledge.approvals || knowledge.approvals.length === 0) return false;

  return knowledge.communityIds.every(ownerCommId =>
    knowledge.approvals.some(
      app => app.communityId === ownerCommId && app.status === 'approved'
    )
  );
}

/**
 * Checks if a user holds an explicit, non-expired, non-revoked access grant for a knowledge item.
 */
export function hasExplicitAccessGrant(user: User, knowledge: KnowledgeItem): boolean {
  if (!user || !knowledge) return false;

  // Check structured accessGrants first
  if (Array.isArray(knowledge.accessGrants) && knowledge.accessGrants.length > 0) {
    const now = Date.now();
    const activeGrant = knowledge.accessGrants.find(g => {
      if (g.userId !== user.id) return false;
      if (g.revokedAt) return false;
      if (g.expiresAt && new Date(g.expiresAt).getTime() <= now) return false;
      return true;
    });
    if (activeGrant) return true;
  }

  // Legacy adapter: for restricted items, check authorizedUserIds if not a default public list
  if (
    knowledge.permissions.consultation === 'restricted' &&
    Array.isArray(knowledge.authorizedUserIds) &&
    knowledge.authorizedUserIds.includes(user.id)
  ) {
    return true;
  }

  return false;
}

/**
 * P0.3: Centralized Read Authorization (`canReadKnowledge`).
 * Enforces strict separation between public, community, restricted, and private levels.
 */
export function canReadKnowledge(
  user: User,
  knowledge: KnowledgeItem
): { allowed: boolean; reason: string; canRequest: boolean } {
  if (!user || !knowledge) {
    return { allowed: false, reason: 'Recurso o usuario no válido.', canRequest: false };
  }

  // 1. Author always has access
  if (knowledge.authorUserId === user.id) {
    return { allowed: true, reason: 'Eres la persona autora o aportante de este saber.', canRequest: false };
  }

  const isCustodianOfOwnerCommunity = canCustodianReviewResource(user, knowledge);

  // 2. If item is not approved or lacks unanimous multi-community approval, only author and owner custodians can read
  if (knowledge.status !== 'approved' || !hasUnanimousOwnerApproval(knowledge)) {
    if (isCustodianOfOwnerCommunity) {
      return {
        allowed: true,
        reason: 'Acceso de custodia territorial para revisión previa a publicación.',
        canRequest: false
      };
    }
    return {
      allowed: false,
      reason: 'Este saber se encuentra pendiente de aprobación unánime por las custodias titulares.',
      canRequest: false
    };
  }

  // 3. Evaluate by consultation level
  const level = knowledge.permissions.consultation;

  if (level === 'public') {
    return {
      allowed: true,
      reason: 'Saber aprobado para consulta pública abierta.',
      canRequest: false
    };
  }

  if (level === 'community') {
    const isVerifiedMemberOfOwner = knowledge.communityIds.some(cId =>
      isUserVerifiedMemberOfCommunity(user, cId)
    );
    if (isVerifiedMemberOfOwner || isCustodianOfOwnerCommunity) {
      return {
        allowed: true,
        reason: 'Acceso concedido como integrante verificado de la comunidad titular.',
        canRequest: false
      };
    }
    if (hasExplicitAccessGrant(user, knowledge)) {
      return {
        allowed: true,
        reason: 'Cuentas con un permiso de acceso explícito vigente otorgado por la custodia.',
        canRequest: false
      };
    }
    return {
      allowed: false,
      reason: `Reservado para integrantes verificados de ${knowledge.communityNames.join(' / ')}.`,
      canRequest: true
    };
  }

  if (level === 'restricted') {
    // Restricted requires an explicit access grant (or being custodian of the owner community)
    if (isCustodianOfOwnerCommunity || hasExplicitAccessGrant(user, knowledge)) {
      return {
        allowed: true,
        reason: 'Cuentas con autorización explícita vigente para consultar este saber restringido.',
        canRequest: false
      };
    }
    return {
      allowed: false,
      reason: 'Acceso restringido: requiere solicitud formal aprobada y vigente por la custodia territorial.',
      canRequest: true
    };
  }

  // level === 'private'
  if (isCustodianOfOwnerCommunity || hasExplicitAccessGrant(user, knowledge)) {
    return {
      allowed: true,
      reason: 'Acceso autorizado bajo custodia tradicional reservada.',
      canRequest: false
    };
  }

  return {
    allowed: false,
    reason: 'Contenido privado de custodia espiritual/tradicional interna. No admite solicitudes externas.',
    canRequest: false
  };
}

/**
 * P0.4: Resolves granular permission for a specific AI operation (`query`, `transcribe`, `transform`, `generate_audio`, `publish_derivative`)
 * with backward-compatible adapter for legacy `aiQueryAllowed`.
 */
export function resolveAiOperationPermission(
  knowledge: KnowledgeItem,
  operation: AiOperation
): AiOperationPermission {
  const perms = knowledge.permissions;
  const globalRevokedAt = perms.revokedAt;
  const globalExpiresAt = perms.expiresAt;

  if (perms.operations && perms.operations[operation]) {
    const explicitOp = perms.operations[operation];
    return {
      ...explicitOp,
      revokedAt: explicitOp.revokedAt || globalRevokedAt,
      expiresAt: explicitOp.expiresAt || globalExpiresAt
    };
  }

  // Legacy adapter from `aiQueryAllowed`
  const legacyMode = perms.aiQueryAllowed;
  const isAllowed = legacyMode !== 'none';
  const requiresApproval =
    operation === 'publish_derivative' ||
    operation === 'transform' ||
    legacyMode === 'derived_approval_required' ||
    perms.derivativePublicationApprovalRequired;

  return {
    operation,
    allowed:
      operation === 'query' || operation === 'transcribe'
        ? isAllowed
        : isAllowed && perms.derivativeGenerationAllowed,
    requiresApproval,
    externalProviderAllowed: false,
    revokedAt: globalRevokedAt,
    expiresAt: globalExpiresAt
  };
}

/**
 * P0.3 & P0.6: Evaluates whether a user can query a knowledge item with CEIBA (`operation = 'query'`).
 * Enforces: 1) Read permission first, 2) Non-revoked AI permission, 3) Specific `query` operation allowed.
 */
export function canQueryKnowledgeWithAI(
  user: User,
  knowledge: KnowledgeItem
): { allowed: boolean; reason: string; refusalReason?: CeibaQueryResponse['refusalReason'] } {
  const readCheck = canReadKnowledge(user, knowledge);
  if (!readCheck.allowed) {
    return {
      allowed: false,
      reason: 'No tienes permiso de lectura sobre este saber.',
      refusalReason: 'NO_READ_PERMISSION'
    };
  }

  const queryPerm = resolveAiOperationPermission(knowledge, 'query');

  if (queryPerm.revokedAt) {
    return {
      allowed: false,
      reason: 'El permiso de procesamiento con inteligencia artificial fue revocado por la custodia titular.',
      refusalReason: 'AI_PERMISSION_REVOKED'
    };
  }

  if (queryPerm.expiresAt && new Date(queryPerm.expiresAt).getTime() <= Date.now()) {
    return {
      allowed: false,
      reason: 'El permiso temporal de procesamiento con inteligencia artificial ha expirado.',
      refusalReason: 'AI_PERMISSION_REVOKED'
    };
  }

  if (!queryPerm.allowed) {
    return {
      allowed: false,
      reason: 'Este saber puede ser consultado por ti, pero no está autorizado para procesamiento con inteligencia artificial.',
      refusalReason: 'AI_NOT_ALLOWED'
    };
  }

  return {
    allowed: true,
    reason: 'Consulta asistida por Ceiba autorizada sobre esta fuente.'
  };
}

/**
 * P0.3 & P0.4: Evaluates whether a user can run "Transformar para enseñar" (`operation = 'transform'`).
 */
export function canTransformKnowledgeWithAI(
  user: User,
  knowledge: KnowledgeItem
): { allowed: boolean; requiresApproval: boolean; reason: string } {
  const queryCheck = canQueryKnowledgeWithAI(user, knowledge);
  if (!queryCheck.allowed) {
    return {
      allowed: false,
      requiresApproval: true,
      reason: queryCheck.reason
    };
  }

  const transformPerm = resolveAiOperationPermission(knowledge, 'transform');
  if (transformPerm.revokedAt || !transformPerm.allowed) {
    return {
      allowed: false,
      requiresApproval: true,
      reason: 'La comunidad titular no autoriza generar transformaciones o materiales derivados con IA sobre este saber.'
    };
  }

  return {
    allowed: true,
    requiresApproval: true, // All transformed outputs are born as draft pending review
    reason: 'Transformación pedagógica permitida en modo borrador sujeto a revisión del custodio.'
  };
}

/**
 * P0.3: Checks if a user can review/approve a proposed KnowledgeItem.
 */
export function canReviewKnowledge(user: User, knowledge: KnowledgeItem): boolean {
  return canCustodianReviewResource(user, knowledge);
}

/**
 * P0.2 & P0.3: Checks if a user can review/approve an AI derivative (`AILabArtifact`).
 */
export function canReviewAIDerivative(user: User, derivative: AILabArtifact): boolean {
  return canCustodianReviewResource(user, derivative);
}
