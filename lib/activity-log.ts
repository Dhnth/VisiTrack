import { query } from './db'

type ActivityAction = 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'

interface ActivityLogParams {
  instance_id: number | null
  user_id: number
  action: ActivityAction
  table_name: string
  record_id: number | null
  description: string
  old_data?: unknown
  new_data?: unknown
  ip_address?: string
  user_agent?: string
}

export async function createActivityLog(params: ActivityLogParams) {
  try {
    await query(
      `INSERT INTO activity_logs 
       (instance_id, user_id, action, table_name, record_id, description, old_data, new_data, ip_address, user_agent, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        params.instance_id,
        params.user_id,
        params.action,
        params.table_name,
        params.record_id,
        params.description,
        params.old_data ? JSON.stringify(params.old_data) : null,
        params.new_data ? JSON.stringify(params.new_data) : null,
        params.ip_address || null,
        params.user_agent || null,
      ]
    )
  } catch (error) {
    console.error('Failed to create activity log:', error)
  }
}