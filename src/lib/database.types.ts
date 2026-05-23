import type {
  AccessRequestRole,
  AccessRequestStatus,
  AccessScope,
  AppRole,
  AppointmentStatus,
  AppointmentType,
  MedicineEntry,
  NotificationCategory,
  OrderStatus,
  RelationType,
  ReminderStatus,
} from './types'

export type Json = unknown

type DemoAuthRpcResult = {
  email: string | null
  full_name: string | null
  id: string
  onboarding_complete: boolean
  phone: string | null
  primary_role: AppRole
}

export interface Database {
  public: {
    Tables: {
      access_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          member_id: string | null
          metadata: Json | null
          target_group_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          member_id?: string | null
          metadata?: Json | null
          target_group_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          member_id?: string | null
          metadata?: Json | null
          target_group_id?: string | null
        }
        Relationships: []
      }
      access_grants: {
        Row: {
          consultation_note: string | null
          created_at: string
          expires_at: string | null
          granted_by: string
          grantee_name: string | null
          grantee_role: AccessRequestRole
          grantee_user_id: string
          id: string
          member_ids: string[]
          permission_scopes: AccessScope[]
          reason: string | null
          request_id: string | null
          revoked_at: string | null
          revoked_by: string | null
          starts_at: string
          status: Database["public"]["Enums"]["access_grant_status"]
          target_group_id: string
        }
        Insert: {
          consultation_note?: string | null
          created_at?: string
          expires_at?: string | null
          granted_by: string
          grantee_name?: string | null
          grantee_role: AccessRequestRole
          grantee_user_id: string
          id?: string
          member_ids?: string[]
          permission_scopes?: AccessScope[]
          reason?: string | null
          request_id?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["access_grant_status"]
          target_group_id: string
        }
        Update: {
          consultation_note?: string | null
          created_at?: string
          expires_at?: string | null
          granted_by?: string
          grantee_name?: string | null
          grantee_role?: AccessRequestRole
          grantee_user_id?: string
          id?: string
          member_ids?: string[]
          permission_scopes?: AccessScope[]
          reason?: string | null
          request_id?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["access_grant_status"]
          target_group_id?: string
        }
        Relationships: []
      }
      access_requests: {
        Row: {
          consent_code: string
          created_at: string
          expires_at: string | null
          id: string
          member_ids: string[]
          reason: string | null
          requested_scopes: AccessScope[]
          requester_id: string
          requester_name: string | null
          requester_organization: string | null
          requester_phone: string | null
          requester_role: AccessRequestRole
          reviewed_at: string | null
          reviewed_by: string | null
          status: AccessRequestStatus
          target_group_id: string
        }
        Insert: {
          consent_code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          member_ids?: string[]
          reason?: string | null
          requested_scopes?: AccessScope[]
          requester_id: string
          requester_name?: string | null
          requester_organization?: string | null
          requester_phone?: string | null
          requester_role: AccessRequestRole
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: AccessRequestStatus
          target_group_id: string
        }
        Update: {
          consent_code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          member_ids?: string[]
          reason?: string | null
          requested_scopes?: AccessScope[]
          requester_id?: string
          requester_name?: string | null
          requester_organization?: string | null
          requester_phone?: string | null
          requester_role?: AccessRequestRole
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: AccessRequestStatus
          target_group_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          advice_summary: string | null
          appointment_type: AppointmentType
          booked_by: string
          created_at: string
          diagnosis: string | null
          family_group_id: string
          follow_up_date: string | null
          id: string
          location: string | null
          member_id: string
          mode: string | null
          notes: string | null
          provider_contact: string | null
          provider_name: string | null
          provider_role: string | null
          scheduled_for: string
          status: AppointmentStatus
          title: string
          updated_at: string
          updated_by: string | null
          visit_summary: string | null
        }
        Insert: {
          advice_summary?: string | null
          appointment_type?: AppointmentType
          booked_by: string
          created_at?: string
          diagnosis?: string | null
          family_group_id: string
          follow_up_date?: string | null
          id?: string
          location?: string | null
          member_id: string
          mode?: string | null
          notes?: string | null
          provider_contact?: string | null
          provider_name?: string | null
          provider_role?: string | null
          scheduled_for: string
          status?: AppointmentStatus
          title: string
          updated_at?: string
          updated_by?: string | null
          visit_summary?: string | null
        }
        Update: {
          advice_summary?: string | null
          appointment_type?: AppointmentType
          booked_by?: string
          created_at?: string
          diagnosis?: string | null
          family_group_id?: string
          follow_up_date?: string | null
          id?: string
          location?: string | null
          member_id?: string
          mode?: string | null
          notes?: string | null
          provider_contact?: string | null
          provider_name?: string | null
          provider_role?: string | null
          scheduled_for?: string
          status?: AppointmentStatus
          title?: string
          updated_at?: string
          updated_by?: string | null
          visit_summary?: string | null
        }
        Relationships: []
      }
      care_tasks: {
        Row: {
          assigned_to_user_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          family_group_id: string
          id: string
          member_id: string
          status: string
          title: string
        }
        Insert: {
          assigned_to_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          family_group_id: string
          id?: string
          member_id: string
          status?: string
          title: string
        }
        Update: {
          assigned_to_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          family_group_id?: string
          id?: string
          member_id?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      caretaker_profiles: {
        Row: {
          address: string | null
          created_at: string
          relation: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          relation?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          relation?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chemist_profiles: {
        Row: {
          address: string | null
          created_at: string
          license_number: string | null
          service_area: string | null
          store_name: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          license_number?: string | null
          service_area?: string | null
          store_name?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          license_number?: string | null
          service_area?: string | null
          store_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      demo_auth_accounts: {
        Row: {
          created_at: string
          email: string | null
          password_hash: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          password_hash: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          password_hash?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      doctor_profiles: {
        Row: {
          address: string | null
          clinic_name: string | null
          consultation_note: string | null
          created_at: string
          license_number: string | null
          specialization: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          clinic_name?: string | null
          consultation_note?: string | null
          created_at?: string
          license_number?: string | null
          specialization?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          clinic_name?: string | null
          consultation_note?: string | null
          created_at?: string
          license_number?: string | null
          specialization?: string | null
          user_id?: string
        }
        Relationships: []
      }
      family_groups: {
        Row: {
          admin_id: string
          created_at: string
          group_name: string
          id: string
          share_code: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          group_name?: string
          id?: string
          share_code?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          group_name?: string
          id?: string
          share_code?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          allergies: string[]
          blood_group: string | null
          chronic_conditions: string[]
          created_at: string
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          group_id: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          relation: RelationType
        }
        Insert: {
          allergies?: string[]
          blood_group?: string | null
          chronic_conditions?: string[]
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          group_id: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          relation: RelationType
        }
        Update: {
          allergies?: string[]
          blood_group?: string | null
          chronic_conditions?: string[]
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          group_id?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          relation?: RelationType
        }
        Relationships: []
      }
      hospital_profiles: {
        Row: {
          address: string | null
          created_at: string
          department: string | null
          hospital_name: string | null
          registration_number: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          department?: string | null
          hospital_name?: string | null
          registration_number?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          department?: string | null
          hospital_name?: string | null
          registration_number?: string | null
          user_id?: string
        }
        Relationships: []
      }
      medicine_order_items: {
        Row: {
          created_at: string
          dosage: string | null
          id: string
          instructions: string | null
          is_substitute: boolean
          medicine_name: string
          order_id: string
          quantity: string | null
          source: string
          substitute_for: string | null
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          id?: string
          instructions?: string | null
          is_substitute?: boolean
          medicine_name: string
          order_id: string
          quantity?: string | null
          source?: string
          substitute_for?: string | null
        }
        Update: {
          created_at?: string
          dosage?: string | null
          id?: string
          instructions?: string | null
          is_substitute?: boolean
          medicine_name?: string
          order_id?: string
          quantity?: string | null
          source?: string
          substitute_for?: string | null
        }
        Relationships: []
      }
      medicine_orders: {
        Row: {
          chemist_id: string | null
          chemist_name: string | null
          created_at: string
          delivery_address: string
          family_group_id: string
          id: string
          location_text: string | null
          map_link: string | null
          notes: string | null
          order_number: string
          patient_member_id: string | null
          placed_by_name: string | null
          placed_by_user_id: string
          placed_for_name: string
          placed_for_phone: string | null
          receiver_name: string
          receiver_phone: string | null
          source_prescription_id: string | null
          status: OrderStatus
          total_items: number
          updated_at: string
          uploaded_prescription_url: string | null
        }
        Insert: {
          chemist_id?: string | null
          chemist_name?: string | null
          created_at?: string
          delivery_address: string
          family_group_id: string
          id?: string
          location_text?: string | null
          map_link?: string | null
          notes?: string | null
          order_number?: string
          patient_member_id?: string | null
          placed_by_name?: string | null
          placed_by_user_id: string
          placed_for_name: string
          placed_for_phone?: string | null
          receiver_name: string
          receiver_phone?: string | null
          source_prescription_id?: string | null
          status?: OrderStatus
          total_items?: number
          updated_at?: string
          uploaded_prescription_url?: string | null
        }
        Update: {
          chemist_id?: string | null
          chemist_name?: string | null
          created_at?: string
          delivery_address?: string
          family_group_id?: string
          id?: string
          location_text?: string | null
          map_link?: string | null
          notes?: string | null
          order_number?: string
          patient_member_id?: string | null
          placed_by_name?: string | null
          placed_by_user_id?: string
          placed_for_name?: string
          placed_for_phone?: string | null
          receiver_name?: string
          receiver_phone?: string | null
          source_prescription_id?: string | null
          status?: OrderStatus
          total_items?: number
          updated_at?: string
          uploaded_prescription_url?: string | null
        }
        Relationships: []
      }
      medicine_reminders: {
        Row: {
          created_at: string
          dosage: string
          end_date: string
          frequency: string
          id: string
          is_active: boolean
          medicine_name: string
          member_id: string
          prescription_id: string | null
          reminder_times: string[]
          start_date: string
        }
        Insert: {
          created_at?: string
          dosage: string
          end_date: string
          frequency: string
          id?: string
          is_active?: boolean
          medicine_name: string
          member_id: string
          prescription_id?: string | null
          reminder_times?: string[]
          start_date: string
        }
        Update: {
          created_at?: string
          dosage?: string
          end_date?: string
          frequency?: string
          id?: string
          is_active?: boolean
          medicine_name?: string
          member_id?: string
          prescription_id?: string | null
          reminder_times?: string[]
          start_date?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          category: NotificationCategory
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body: string
          category: NotificationCategory
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string
          category?: NotificationCategory
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      order_chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          order_id: string
          sender_id: string
          sender_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          order_id: string
          sender_id: string
          sender_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          order_id?: string
          sender_id?: string
          sender_name?: string | null
        }
        Relationships: []
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          note: string | null
          order_id: string
          status: OrderStatus
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          order_id: string
          status: OrderStatus
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string
          status?: OrderStatus
        }
        Relationships: []
      }
      patient_records: {
        Row: {
          file_name: string
          file_type: string
          file_url: string
          id: string
          member_id: string
          notes: string | null
          record_type: string
          upload_date: string
          uploaded_by: string
        }
        Insert: {
          file_name: string
          file_type: string
          file_url: string
          id?: string
          member_id: string
          notes?: string | null
          record_type: string
          upload_date?: string
          uploaded_by: string
        }
        Update: {
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          member_id?: string
          notes?: string | null
          record_type?: string
          upload_date?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          created_at: string
          doctor_name: string | null
          file_url: string | null
          id: string
          medicines: MedicineEntry[]
          member_id: string
          prescription_date: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          doctor_name?: string | null
          file_url?: string | null
          id?: string
          medicines?: MedicineEntry[]
          member_id: string
          prescription_date: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          doctor_name?: string | null
          file_url?: string | null
          id?: string
          medicines?: MedicineEntry[]
          member_id?: string
          prescription_date?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          allergies: string[]
          avatar_url: string | null
          blood_group: string | null
          chronic_conditions: string[]
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string | null
          gender: string | null
          id: string
          onboarding_complete: boolean
          phone: string | null
          primary_role: AppRole
          updated_at: string
        }
        Insert: {
          address?: string | null
          allergies?: string[]
          avatar_url?: string | null
          blood_group?: string | null
          chronic_conditions?: string[]
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          onboarding_complete?: boolean
          phone?: string | null
          primary_role?: AppRole
          updated_at?: string
        }
        Update: {
          address?: string | null
          allergies?: string[]
          avatar_url?: string | null
          blood_group?: string | null
          chronic_conditions?: string[]
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          onboarding_complete?: boolean
          phone?: string | null
          primary_role?: AppRole
          updated_at?: string
        }
        Relationships: []
      }
      reminder_logs: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          reminder_id: string
          scheduled_time: string
          status: ReminderStatus
          taken_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          reminder_id: string
          scheduled_time: string
          status?: ReminderStatus
          taken_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          reminder_id?: string
          scheduled_time?: string
          status?: string
          taken_at?: string | null
        }
        Relationships: []
      }
      vital_entries: {
        Row: {
          family_group_id: string
          id: string
          member_id: string
          metric_type: string
          notes: string | null
          recorded_at: string
          recorded_by: string | null
          symptoms: string[]
          unit: string | null
          value_primary: string
          value_secondary: string | null
        }
        Insert: {
          family_group_id: string
          id?: string
          member_id: string
          metric_type: string
          notes?: string | null
          recorded_at?: string
          recorded_by?: string | null
          symptoms?: string[]
          unit?: string | null
          value_primary: string
          value_secondary?: string | null
        }
        Update: {
          family_group_id?: string
          id?: string
          member_id?: string
          metric_type?: string
          notes?: string | null
          recorded_at?: string
          recorded_by?: string | null
          symptoms?: string[]
          unit?: string | null
          value_primary?: string
          value_secondary?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      login_demo_user: {
        Args: {
          p_identifier: string
          p_password: string
        }
        Returns: DemoAuthRpcResult
      }
      register_demo_user: {
        Args: {
          p_full_name: string | null
          p_identifier: string
          p_password: string
          p_primary_role: AppRole
        }
        Returns: DemoAuthRpcResult
      }
      reset_demo_password: {
        Args: {
          p_identifier: string
          p_new_password: string
        }
        Returns: undefined
      }
      sync_demo_auth_identity: {
        Args: {
          p_email?: string | null
          p_phone?: string | null
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      access_grant_status: "active" | "revoked" | "expired"
      access_request_status: "pending" | "approved" | "rejected" | "revoked" | "expired"
      app_role: "patient_admin" | "family_member" | "caretaker" | "doctor" | "hospital" | "chemist"
      notification_category:
        | "access_request"
        | "access_update"
        | "order_update"
        | "chat_message"
        | "reminder"
        | "system"
        | "appointment"
        | "health_alert"
      order_status:
        | "placed"
        | "awaiting_chemist_approval"
        | "accepted"
        | "preparing"
        | "packed"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
        | "rejected"
    }
    CompositeTypes: Record<string, never>
  }
}

export type PublicSchema = Database["public"]
export type TableName = keyof PublicSchema["Tables"]
export type TableRow<T extends TableName> = PublicSchema["Tables"][T]["Row"]
export type TableInsert<T extends TableName> = PublicSchema["Tables"][T]["Insert"]
export type TableUpdate<T extends TableName> = PublicSchema["Tables"][T]["Update"]
