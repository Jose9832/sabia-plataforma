import type { Community, User } from '../types/index.ts';
import { DEMO_COMMUNITIES } from '../data/mockData.ts';

export interface ICommunityService {
  listCommunities(): Community[];
  getVerifiedCommunitiesForUser(user: User, communities: Community[]): Community[];
}

export class MockCommunityService implements ICommunityService {
  listCommunities(): Community[] {
    return DEMO_COMMUNITIES;
  }

  /**
   * P0.1: Returns only the communities where `user` holds a VERIFIED membership.
   */
  getVerifiedCommunitiesForUser(user: User, communities: Community[]): Community[] {
    const verifiedIds = user.affiliations
      .filter(a => a.status === 'verified' && a.role !== 'none')
      .map(a => a.communityId);

    return communities.filter(c => verifiedIds.includes(c.id));
  }
}

export const communityService = new MockCommunityService();
