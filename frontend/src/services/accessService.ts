import type { User, AccessRequest, AffiliationRequest, AILabArtifact, KnowledgeItem } from '../types/index.ts';
import { canCustodianReviewResource } from '../domain/authorization.ts';

export interface IAccessService {
  listPendingAccessRequestsForCustodian(user: User, requests: AccessRequest[]): AccessRequest[];
  listPendingAffiliationsForCustodian(user: User, requests: AffiliationRequest[]): AffiliationRequest[];
  listPendingKnowledgeForCustodian(user: User, items: KnowledgeItem[]): KnowledgeItem[];
  listPendingAIDerivativesForCustodian(user: User, artifacts: AILabArtifact[]): AILabArtifact[];
}

export class MockAccessService implements IAccessService {
  listPendingAccessRequestsForCustodian(user: User, requests: AccessRequest[]): AccessRequest[] {
    return requests.filter(r => r.status === 'pending' && canCustodianReviewResource(user, r));
  }

  listPendingAffiliationsForCustodian(user: User, requests: AffiliationRequest[]): AffiliationRequest[] {
    return requests.filter(r => r.status === 'pending' && canCustodianReviewResource(user, r));
  }

  listPendingKnowledgeForCustodian(user: User, items: KnowledgeItem[]): KnowledgeItem[] {
    return items.filter(k => k.status === 'pending_review' && canCustodianReviewResource(user, k));
  }

  /**
   * P0.2: Strictly filters AI derivatives by the custodian's verified communities.
   * Mamo Senen (Sierra) NEVER sees Afro derivatives, and Faustina (Afro) NEVER sees Sierra derivatives.
   */
  listPendingAIDerivativesForCustodian(user: User, artifacts: AILabArtifact[]): AILabArtifact[] {
    return artifacts.filter(
      a => a.status === 'draft_pending_review' && canCustodianReviewResource(user, a)
    );
  }
}

export const accessService = new MockAccessService();
