import { api } from '../stores/authStore';

export interface UpdateProfileRequest {
  weightKg?: number;
  heightCm?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  stepGoal?: number;
  name?: string;
}

export interface UserProfile {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  stepGoal: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profile?: UserProfile;
}

class ProfileService {
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await api.patch<User>('/users/me/profile', data);
    return response.data;
  }
}

export const profileService = new ProfileService();
