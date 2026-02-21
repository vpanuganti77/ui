import { getAll, getById, create, update, remove } from '../../shared/services/storage/fileDataService';
import { Room } from './types';

export const roomService = {
  async getAll(): Promise<Room[]> {
    return await getAll('rooms');
  },

  async getById(id: string): Promise<Room> {
    return await getById('rooms', id);
  },

  async create(room: Partial<Room>): Promise<Room> {
    const newRoom = {
      ...room,
      id: Date.now().toString(),
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return await create('rooms', newRoom);
  },

  async update(id: string, room: Partial<Room>): Promise<Room> {
    const updatedRoom = {
      ...room,
      updatedAt: new Date().toISOString()
    };
    return await update('rooms', id, updatedRoom);
  },

  async delete(id: string): Promise<void> {
    return await remove('rooms', id);
  }
};
