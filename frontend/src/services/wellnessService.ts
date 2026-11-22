import { WellnessItem } from '../types';
import { WELLNESS_ITEMS } from '../data/mockData';

/**
 * P1.5: Independent Wellness / Health Orientation Service.
 * Strictly isolated from SABIA's cultural repository and CEIBA's RAG index
 * in compliance with data minimization and sensitive health data separation (Ley 1581 de 2012).
 */
export class MockWellnessService {
  listWellnessChannels(category = 'all'): WellnessItem[] {
    if (category === 'all') return WELLNESS_ITEMS;
    return WELLNESS_ITEMS.filter(w => w.category === category);
  }
}

export const wellnessService = new MockWellnessService();
