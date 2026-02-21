import { getAll } from '../shared/services/storage/fileDataService';

export interface HostelWithOwner {
  id: string;
  name: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminUserId: string | null;
  [key: string]: any;
}

/**
 * Finds the admin user for a given hostel using multiple matching strategies
 */
export const findAdminUserForHostel = (hostel: any, users: any[]): any | null => {
  // Strategy 1: Direct hostelId and role match
  let admin = users.find((user: any) => {
    const userHostelId = String(user.hostelId || '').trim();
    const hostelId = String(hostel.id || '').trim();
    const userRole = String(user.role || '').toLowerCase().trim();
    
    return userHostelId === hostelId && userRole === 'admin';
  });
  
  // Strategy 2: Email match (using contactEmail from hostel)
  if (!admin && hostel.contactEmail) {
    admin = users.find((user: any) => 
      String(user.email || '').toLowerCase().trim() === String(hostel.contactEmail || '').toLowerCase().trim() &&
      String(user.role || '').toLowerCase().trim() === 'admin'
    );
  }
  
  // Strategy 3: Phone match (using contactPhone from hostel)
  if (!admin && hostel.contactPhone) {
    admin = users.find((user: any) => 
      String(user.phone || '').trim() === String(hostel.contactPhone || '').trim() &&
      String(user.role || '').toLowerCase().trim() === 'admin'
    );
  }
  
  return admin;
};

/**
 * Enriches hostel data with owner information from users
 */
export const enrichHostelsWithOwnerInfo = (hostels: any[], users: any[]): HostelWithOwner[] => {
  return hostels.map((hostel: any) => {
    const admin = findAdminUserForHostel(hostel, users);
    
    // Use contactPerson, contactEmail, contactPhone from hostel data
    const ownerName = hostel.contactPerson || admin?.name || 'N/A';
    const ownerEmail = admin?.email || hostel.contactEmail || 'N/A';
    const ownerPhone = admin?.phone || hostel.contactPhone || 'N/A';
    
    return {
      ...hostel,
      adminName: ownerName,
      adminEmail: ownerEmail,
      adminPhone: ownerPhone,
      adminUserId: admin?.id || null
    };
  });
};

/**
 * Fetches hostels with enriched owner information
 */
export const getHostelsWithOwners = async (): Promise<HostelWithOwner[]> => {
  try {
    const [hostels, users] = await Promise.all([
      getAll('hostels'),
      getAll('users')
    ]);
    
    return enrichHostelsWithOwnerInfo(hostels, users);
  } catch (error) {
    console.error('Error fetching hostels with owners:', error);
    throw new Error('Failed to load hostel and owner data');
  }
};

/**
 * Gets owner information for a specific hostel
 */
export const getHostelOwnerInfo = async (hostelId: string): Promise<{
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  adminUserId: string | null;
  hasUserAccount: boolean;
}> => {
  try {
    const [hostels, users] = await Promise.all([
      getAll('hostels'),
      getAll('users')
    ]);
    
    const hostel = hostels.find((h: any) => h.id === hostelId);
    if (!hostel) {
      throw new Error('Hostel not found');
    }
    
    const admin = findAdminUserForHostel(hostel, users);
    
    return {
      ownerName: hostel.adminName || admin?.name || 'N/A',
      ownerEmail: admin?.email || hostel.adminEmail || 'N/A',
      ownerPhone: admin?.phone || hostel.adminPhone || 'N/A',
      adminUserId: admin?.id || null,
      hasUserAccount: !!admin
    };
  } catch (error) {
    console.error('Error fetching hostel owner info:', error);
    throw error;
  }
};
