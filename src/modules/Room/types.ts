export interface Room {
  id: string;
  roomNumber: string;
  capacity: string;
  rent: number;
  floor: number;
  amenities?: string;
  type?: string;
  status: 'available' | 'occupied' | 'maintenance';
  hostelId: string;
  hostelName?: string;
  createdAt: string;
  updatedAt: string;
}
