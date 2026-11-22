import { User, KnowledgeItem } from '../types';
import { canReadKnowledge, canCustodianReviewResource } from '../domain/authorization';

export interface IKnowledgeService {
  listVisibleForUser(user: User, allItems: KnowledgeItem[]): KnowledgeItem[];
  getByIdForUser(user: User, id: string, allItems: KnowledgeItem[]): { allowed: boolean; item?: KnowledgeItem; reason: string };
}

export class MockKnowledgeService implements IKnowledgeService {
  /**
   * Lists knowledge items visible in the library catalog.
   * Unapproved drafts are only visible to their author or verified custodians of their owner communities.
   */
  listVisibleForUser(user: User, allItems: KnowledgeItem[]): KnowledgeItem[] {
    return allItems.filter(item => {
      if (item.status === 'approved') return true;
      if (item.authorUserId === user.id) return true;
      return canCustodianReviewResource(user, item);
    });
  }

  /**
   * Enforces object-level authorization (preventing IDOR) when accessing a knowledge item by ID.
   */
  getByIdForUser(
    user: User,
    id: string,
    allItems: KnowledgeItem[]
  ): { allowed: boolean; item?: KnowledgeItem; reason: string } {
    const found = allItems.find(k => k.id === id);
    if (!found) {
      return { allowed: false, reason: 'El saber solicitado no existe.' };
    }
    const check = canReadKnowledge(user, found);
    if (!check.allowed) {
      return { allowed: false, reason: check.reason };
    }
    return { allowed: true, item: found, reason: check.reason };
  }
}

export const knowledgeService = new MockKnowledgeService();
