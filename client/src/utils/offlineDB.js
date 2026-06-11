import Dexie from 'dexie'

// Initialize IndexedDB database
export const db = new Dexie('TriompheDB')

db.version(1).stores({
  products: 'id',
  sales: 'id, created_at',
  agents: 'id',
  invoices: 'id',
  pendingSync: '++id, timestamp'
})

// Sync function - called when online
export const syncDataToServer = async () => {
  try {
    const pendingItems = await db.pendingSync.toArray()
    
    for (const item of pendingItems) {
      try {
        // Sync based on type
        switch(item.type) {
          case 'product':
            if (item.action === 'create') {
              await fetch('/api/products', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(item.data)
              })
            } else if (item.action === 'update') {
              await fetch(`/api/products/${item.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(item.data)
              })
            } else if (item.action === 'delete') {
              await fetch(`/api/products/${item.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              })
            }
            break
          case 'sale':
            if (item.action === 'create') {
              await fetch('/api/sales', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(item.data)
              })
            }
            break
        }
        
        // Delete from pending after successful sync
        await db.pendingSync.delete(item.id)
      } catch (err) {
        console.error('Sync error for item:', item, err)
      }
    }
    
    return { success: true, syncedCount: pendingItems.length }
  } catch (err) {
    console.error('Sync error:', err)
    return { success: false, error: err.message }
  }
}
