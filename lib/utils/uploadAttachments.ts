import type { AttachmentEntityType } from '@/types/attachment';

export async function uploadPendingAttachments(
  files: File[],
  entityType: AttachmentEntityType,
  entityId: number,
): Promise<void> {
  if (!files.length) return;

  await Promise.allSettled(
    files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entity_type', entityType);
      formData.append('entity_id', String(entityId));

      const res = await fetch('/api/attachments/add', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('Failed to upload attachment:', body?.error ?? 'Unknown error');
      }
    }),
  );
}
