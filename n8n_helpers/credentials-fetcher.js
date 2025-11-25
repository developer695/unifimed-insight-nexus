/**
 * n8n Helper Functions for Retrieving User Credentials from Supabase
 * 
 * This file contains utility functions to fetch platform credentials
 * from Supabase based on user ID. Use these in your n8n workflows.
 */

// ============================================
// Configuration
// ============================================

const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL'; // e.g., https://xxx.supabase.co
const SUPABASE_SERVICE_KEY = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

// ============================================
// Function 1: Get Single Platform Credentials
// ============================================

/**
 * Fetch credentials for a specific platform and user
 * 
 * @param {string} userId - The user's UUID from auth.users
 * @param {string} platformId - Platform identifier (hubspot, linkedin, etc.)
 * @returns {object} Platform credentials or null if not found
 * 
 * Usage in n8n Function Node:
 * const creds = await getPlatformCredentials($json.userId, 'hubspot');
 * return { credentials: creds };
 */
async function getPlatformCredentials(userId, platformId) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/credentials?user_id=eq.${userId}&platform_id=eq.${platformId}&select=credentials`,
            {
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Supabase error: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            return data[0].credentials;
        }

        return null;
    } catch (error) {
        console.error(`Error fetching credentials for ${platformId}:`, error);
        return null;
    }
}

// ============================================
// Function 2: Get All User Credentials
// ============================================

/**
 * Fetch all platform credentials for a user
 * 
 * @param {string} userId - The user's UUID from auth.users
 * @returns {array} Array of credential objects
 * 
 * Usage in n8n Function Node:
 * const allCreds = await getAllUserCredentials($json.userId);
 * return { platforms: allCreds };
 */
async function getAllUserCredentials(userId) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/credentials?user_id=eq.${userId}&select=platform_id,credentials`,
            {
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Supabase error: ${response.status}`);
        }

        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error('Error fetching all user credentials:', error);
        return [];
    }
}

// ============================================
// Function 3: Check If Platform Is Connected
// ============================================

/**
 * Check if a user has configured credentials for a platform
 * 
 * @param {string} userId - The user's UUID
 * @param {string} platformId - Platform identifier
 * @returns {boolean} True if credentials exist
 * 
 * Usage in n8n Function Node:
 * const isConnected = await isPlatformConnected($json.userId, 'hubspot');
 * return { connected: isConnected };
 */
async function isPlatformConnected(userId, platformId) {
    const credentials = await getPlatformCredentials(userId, platformId);
    return credentials !== null;
}

// ============================================
// Function 4: Get Multiple Platform Credentials
// ============================================

/**
 * Fetch credentials for multiple platforms at once
 * 
 * @param {string} userId - The user's UUID
 * @param {array} platformIds - Array of platform identifiers
 * @returns {object} Object with platform IDs as keys and credentials as values
 * 
 * Usage in n8n Function Node:
 * const creds = await getMultiplePlatformCredentials(
 *   $json.userId, 
 *   ['hubspot', 'linkedin', 'openai']
 * );
 * return creds;
 */
async function getMultiplePlatformCredentials(userId, platformIds) {
    try {
        const platformFilter = platformIds.map(id => `"${id}"`).join(',');

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/credentials?user_id=eq.${userId}&platform_id=in.(${platformFilter})&select=platform_id,credentials`,
            {
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Supabase error: ${response.status}`);
        }

        const data = await response.json();

        // Convert array to object with platform_id as key
        const credentialsMap = {};
        data.forEach(item => {
            credentialsMap[item.platform_id] = item.credentials;
        });

        return credentialsMap;
    } catch (error) {
        console.error('Error fetching multiple platform credentials:', error);
        return {};
    }
}

// ============================================
// Function 5: Extract Specific Credential Field
// ============================================

/**
 * Get a specific field from platform credentials
 * 
 * @param {string} userId - The user's UUID
 * @param {string} platformId - Platform identifier
 * @param {string} fieldName - Field name within credentials JSON
 * @returns {any} The field value or null
 * 
 * Usage in n8n Function Node:
 * const apiKey = await getCredentialField($json.userId, 'hubspot', 'apiKey');
 * return { apiKey };
 */
async function getCredentialField(userId, platformId, fieldName) {
    const credentials = await getPlatformCredentials(userId, platformId);
    return credentials ? credentials[fieldName] : null;
}

// ============================================
// Example n8n Workflow Usage
// ============================================

/*

WEBHOOK NODE:
Receives: { userId: "uuid-here", action: "send_email" }

FUNCTION NODE - Fetch Credentials:
----------------------------------
const userId = $json.userId;

// Get HubSpot and Smartlead credentials
const hubspotCreds = await getPlatformCredentials(userId, 'hubspot');
const smartleadCreds = await getPlatformCredentials(userId, 'smartlead');

if (!hubspotCreds || !smartleadCreds) {
  throw new Error('Missing required platform credentials');
}

return {
  userId,
  hubspot: hubspotCreds,
  smartlead: smartleadCreds,
  action: $json.action
};

HTTP REQUEST NODE - Use Credentials:
-------------------------------------
// Use the credentials in subsequent nodes
URL: https://api.hubapi.com/contacts/v1/lists/all/contacts/all
Headers:
  Authorization: Bearer {{$node["Function"].json["hubspot"]["apiKey"]}}

*/

// ============================================
// Error Handling Example
// ============================================

/*

FUNCTION NODE - With Error Handling:
-------------------------------------
const userId = $json.userId;
const platformId = $json.platformId || 'hubspot';

try {
  const credentials = await getPlatformCredentials(userId, platformId);
  
  if (!credentials) {
    return {
      success: false,
      error: `No credentials found for ${platformId}`,
      userId
    };
  }
  
  return {
    success: true,
    credentials,
    platform: platformId
  };
} catch (error) {
  return {
    success: false,
    error: error.message,
    userId
  };
}

*/

// ============================================
// Export Functions (for module use)
// ============================================

module.exports = {
    getPlatformCredentials,
    getAllUserCredentials,
    isPlatformConnected,
    getMultiplePlatformCredentials,
    getCredentialField
};
