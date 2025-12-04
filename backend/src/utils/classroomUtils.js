import Classroom from '../models/Classroom.js';

/**
 * Generate a unique classroom handle from classroom name
 * Format: lowercase-name-with-hyphens-XXXX (where XXXX is random 4 digits)
 * @param {String} name - Classroom name
 * @returns {Promise<String>} - Unique handle
 */
export const generateClassroomHandle = async (name) => {
  const baseHandle = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  let handle = `${baseHandle}-${Math.floor(Math.random() * 10000)}`;
  let exists = await Classroom.findOne({ handle });

  // Ensure uniqueness
  while (exists) {
    handle = `${baseHandle}-${Math.floor(Math.random() * 10000)}`;
    exists = await Classroom.findOne({ handle });
  }

  return handle;
};

/**
 * Generate a unique invite code for classroom
 * Format: 8 random alphanumeric characters (A-Z, 0-9)
 * @returns {String} - Unique invite code
 */
export const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
};

/**
 * Validate if a handle is unique
 * @param {String} handle - Handle to validate
 * @param {String} excludeId - Classroom ID to exclude from check (for updates)
 * @returns {Promise<Boolean>} - True if unique, false if taken
 */
export const isHandleUnique = async (handle, excludeId = null) => {
  const query = { handle };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const existing = await Classroom.findOne(query);
  return !existing;
};
