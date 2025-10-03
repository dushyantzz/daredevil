/**
 * API Key Manager
 * 
 * This utility manages multiple API keys for Gemini and distributes requests
 * across them to improve performance and avoid rate limiting.
 */

// Store API keys and their usage metrics
interface ApiKeyMetrics {
  key: string;
  usageCount: number;
  lastUsed: number;
  isActive: boolean;
}

class ApiKeyManager {
  private geminiKeys: ApiKeyMetrics[] = [];
  private googleKeys: ApiKeyMetrics[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the API key manager with keys from environment variables
   */
  private initialize() {
    if (this.initialized) return;

    // Add the primary GEMINI_API_KEY
    const primaryGeminiKey = process.env.GEMINI_API_KEY;
    if (primaryGeminiKey) {
      this.geminiKeys.push({
        key: primaryGeminiKey,
        usageCount: 0,
        lastUsed: 0,
        isActive: true
      });
    }

    // Add the primary GOOGLE_API_KEY
    const primaryGoogleKey = process.env.GOOGLE_API_KEY;
    if (primaryGoogleKey) {
      this.googleKeys.push({
        key: primaryGoogleKey,
        usageCount: 0,
        lastUsed: 0,
        isActive: true
      });
    }

    // Add additional Gemini API keys (GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.)
    for (let i = 1; i <= 10; i++) {
      const keyName = `GEMINI_API_KEY_${i}`;
      const key = process.env[keyName];
      if (key) {
        this.geminiKeys.push({
          key,
          usageCount: 0,
          lastUsed: 0,
          isActive: true
        });
      }
    }

    // Add additional Google API keys (GOOGLE_API_KEY_1, GOOGLE_API_KEY_2, etc.)
    for (let i = 1; i <= 10; i++) {
      const keyName = `GOOGLE_API_KEY_${i}`;
      const key = process.env[keyName];
      if (key) {
        this.googleKeys.push({
          key,
          usageCount: 0,
          lastUsed: 0,
          isActive: true
        });
      }
    }

    this.initialized = true;
    console.log(`API Key Manager initialized with ${this.geminiKeys.length} Gemini keys and ${this.googleKeys.length} Google keys`);
  }

  /**
   * Get the next available Gemini API key using a round-robin approach
   */
  getGeminiApiKey(): string {
    if (!this.initialized) this.initialize();
    
    if (this.geminiKeys.length === 0) {
      throw new Error('No Gemini API keys available');
    }

    // Sort by usage count (ascending) and then by last used timestamp (ascending)
    this.geminiKeys.sort((a, b) => {
      if (a.usageCount !== b.usageCount) return a.usageCount - b.usageCount;
      return a.lastUsed - b.lastUsed;
    });

    // Get the first active key
    const activeKey = this.geminiKeys.find(k => k.isActive);
    if (!activeKey) {
      throw new Error('No active Gemini API keys available');
    }

    // Update metrics
    activeKey.usageCount++;
    activeKey.lastUsed = Date.now();

    return activeKey.key;
  }

  /**
   * Get the next available Google API key using a round-robin approach
   */
  getGoogleApiKey(): string {
    if (!this.initialized) this.initialize();
    
    if (this.googleKeys.length === 0) {
      throw new Error('No Google API keys available');
    }

    // Sort by usage count (ascending) and then by last used timestamp (ascending)
    this.googleKeys.sort((a, b) => {
      if (a.usageCount !== b.usageCount) return a.usageCount - b.usageCount;
      return a.lastUsed - b.lastUsed;
    });

    // Get the first active key
    const activeKey = this.googleKeys.find(k => k.isActive);
    if (!activeKey) {
      throw new Error('No active Google API keys available');
    }

    // Update metrics
    activeKey.usageCount++;
    activeKey.lastUsed = Date.now();

    return activeKey.key;
  }

  /**
   * Mark a key as inactive (e.g., if it's rate limited or invalid)
   */
  markKeyInactive(key: string): void {
    const allKeys = [...this.geminiKeys, ...this.googleKeys];
    const keyObj = allKeys.find(k => k.key === key);
    if (keyObj) {
      keyObj.isActive = false;
      console.warn(`API key ${key.substring(0, 10)}... marked as inactive`);
    }
  }

  /**
   * Get statistics about key usage
   */
  getStats() {
    return {
      geminiKeys: this.geminiKeys.length,
      googleKeys: this.googleKeys.length,
      activeGeminiKeys: this.geminiKeys.filter(k => k.isActive).length,
      activeGoogleKeys: this.googleKeys.filter(k => k.isActive).length
    };
  }
}

// Create a singleton instance
const apiKeyManager = new ApiKeyManager();

export default apiKeyManager;
