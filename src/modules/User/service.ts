import { getAll, getById, create, update, remove } from '../../shared/services/storage/fileDataService';
import { User } from './types';

export const userService = {
  async getAll(): Promise<User[]> {
    return await getAll('users');
  },

  async getById(id: string): Promise<User> {
    return await getById('users', id);
  },

  async create(user: Partial<User>): Promise<User> {
    const newUser = {
      ...user,
      id: Date.now().toString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return await create('users', newUser);
  },

  async update(id: string, user: Partial<User>): Promise<User> {
    const updatedUser = {
      ...user,
      updatedAt: new Date().toISOString()
    };
    return await update('users', id, updatedUser);
  },

  async delete(id: string): Promise<void> {
    return await remove('users', id);
  },

  async resetPassword(id: string): Promise<string> {
    const newPassword = 'user' + Math.random().toString(36).substring(2, 8);
    const user = await this.getById(id);
    await this.update(id, { 
      ...user, 
      password: newPassword,
      firstLogin: true
    });
    return newPassword;
  },

  async toggleStatus(id: string): Promise<User> {
    const user = await this.getById(id);
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    return await this.update(id, { ...user, status: newStatus });
  },

  async unlockAccount(id: string): Promise<User> {
    const user = await this.getById(id);
    return await this.update(id, { 
      ...user, 
      isLocked: false, 
      failedLoginAttempts: 0,
      lockedAt: undefined,
      lockedBy: undefined
    });
  }
};
