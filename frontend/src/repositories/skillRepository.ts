import { apiRequest } from '../services/api';

export class SkillRepository {
  private static instance: SkillRepository;

  static getInstance(): SkillRepository {
    if (!SkillRepository.instance) {
      SkillRepository.instance = new SkillRepository();
    }
    return SkillRepository.instance;
  }

  async searchSkills(query: string, limit: number = 20): Promise<string[]> {
    const params = new URLSearchParams({
      query,
      limit: String(limit),
    });
    return apiRequest<string[]>(`/skills/?${params}`);
  }
}

export const skillRepository = SkillRepository.getInstance();
