export type AttachmentEntityType = 'vehicle' | 'expense' | 'insurance_contract' | 'reminder';

export interface Attachment {
  id: number;
  owner_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  entity_type: AttachmentEntityType;
  entity_id: number;
  category: string | null;
  preview_path: string | null;
  created_at: string;
}
