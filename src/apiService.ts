// REST and Polling API Client for full-stack PostgreSQL connection
// Replaces firebase client directly with identical API signatures

export const firebaseService = {
  /**
   * Fetch all documents from a backend database collection
   */
  async getCollection<T>(collectionName: string): Promise<T[]> {
    try {
      const res = await fetch(`/api/${collectionName}`);
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      return await res.json() as T[];
    } catch (error) {
      console.error(`Error fetching collection ${collectionName} from server:`, error);
      return [];
    }
  },

  /**
   * Set (insert/overwrite) a document in a collection with custom id
   */
  async saveDoc<T extends { id: string }>(collectionName: string, data: T): Promise<void> {
    try {
      const res = await fetch(`/api/${collectionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
    } catch (error) {
      console.error(`Error saving document to ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Update selective fields of a document in a collection
   */
  async updateDoc(collectionName: string, id: string, fields: Record<string, any>): Promise<void> {
    try {
      const res = await fetch(`/api/${collectionName}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fields)
      });
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
    } catch (error) {
      console.error(`Error updating document ${id} in ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Delete a document from a collection
   */
  async deleteDoc(collectionName: string, id: string): Promise<void> {
    try {
      const res = await fetch(`/api/${collectionName}/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Realtime collection sync using optimized interval-polling
   */
  subscribeCollection<T>(collectionName: string, callback: (data: T[]) => void) {
    let active = true;

    // Do an initial immediate fetch
    firebaseService.getCollection<T>(collectionName)
      .then(data => {
        if (active) {
          callback(data);
        }
      })
      .catch(err => {
        console.error(`Initial sync error on ${collectionName}:`, err);
      });

    // Set up a standard 3-second polling interval (compatible with any aaPanel/proxy hosting)
    const intervalId = setInterval(() => {
      firebaseService.getCollection<T>(collectionName)
        .then(data => {
          if (active) {
            callback(data);
          }
        })
        .catch(err => {
          console.error(`Polling sync error on ${collectionName}:`, err);
        });
    }, 3000);

    // Return the unsubscribe/teardown handle
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }
};
