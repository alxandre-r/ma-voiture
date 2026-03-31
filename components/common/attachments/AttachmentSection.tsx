'use client';

import { useState } from 'react';

import { useNotifications } from '@/contexts/NotificationContext';

import AttachmentGallery from './AttachmentGallery';
import AttachmentUploader from './AttachmentUploader';

import type { Attachment, AttachmentEntityType } from '@/types/attachment';

const MAX_ATTACHMENTS = 5;

interface AttachmentSectionProps {
  /** Already-saved attachments from the DB (shown in both create and edit modes) */
  savedAttachments?: Attachment[];
  /** Entity context — undefined when creating a new entity (entity doesn't exist yet) */
  entityType?: AttachmentEntityType;
  entityId?: number;
  /** Called in Mode A (create): parent collects these to upload after entity creation */
  onPendingFilesChange?: (files: File[]) => void;
  /** Called in Mode B (edit) after a successful upload or delete — use to trigger a data refresh */
  onAttachmentsChange?: () => void;
  isOwner?: boolean;
}

/**
 * Mode A — create: entityId is undefined. Files are collected locally and reported
 *   via onPendingFilesChange. No API calls happen here.
 *
 * Mode B — edit: entityId is defined. File selection triggers an immediate upload
 *   to POST /api/attachments/add, then the saved list refreshes internally.
 */
export default function AttachmentSection({
  savedAttachments = [],
  entityType,
  entityId,
  onPendingFilesChange,
  onAttachmentsChange,
  isOwner = true,
}: AttachmentSectionProps) {
  const { showError } = useNotifications();
  const isEditMode = entityId !== undefined && entityType !== undefined;

  // Mode A: pending files not yet uploaded
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  // Mode B: live saved list (starts from props, updated on upload/delete)
  const [liveSaved, setLiveSaved] = useState<Attachment[]>(savedAttachments);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const currentCount = isEditMode ? liveSaved.length : pendingFiles.length;

  const handleFilesSelected = async (files: File[]) => {
    if (!isEditMode) {
      // Duplicate check
      const dupes = files.filter((f) =>
        pendingFiles.some((p) => p.name === f.name && p.size === f.size),
      );
      if (dupes.length > 0) {
        showError(`"${dupes[0].name}" est déjà dans la liste`);
      }
      const newFiles = files.filter(
        (f) => !pendingFiles.some((p) => p.name === f.name && p.size === f.size),
      );

      // Max files check
      const remaining = MAX_ATTACHMENTS - pendingFiles.length;
      if (remaining <= 0) {
        showError(`Maximum ${MAX_ATTACHMENTS} pièces jointes`);
        return;
      }
      const toAdd = newFiles.slice(0, remaining);
      if (toAdd.length < newFiles.length) {
        showError(`Maximum ${MAX_ATTACHMENTS} pièces jointes`);
      }
      if (toAdd.length === 0) return;

      const next = [...pendingFiles, ...toAdd];
      setPendingFiles(next);
      onPendingFilesChange?.(next);
      return;
    }

    // Mode B: upload immediately
    // Duplicate check against already-saved files
    const dupes = files.filter((f) =>
      liveSaved.some((s) => s.file_name === f.name && s.file_size === f.size),
    );
    if (dupes.length > 0) {
      showError(`"${dupes[0].name}" est déjà dans la liste`);
    }
    const newFiles = files.filter(
      (f) => !liveSaved.some((s) => s.file_name === f.name && s.file_size === f.size),
    );

    // Max files check
    const remaining = MAX_ATTACHMENTS - liveSaved.length;
    if (remaining <= 0) {
      showError(`Maximum ${MAX_ATTACHMENTS} pièces jointes`);
      return;
    }
    const toUpload = newFiles.slice(0, remaining);
    if (toUpload.length < newFiles.length) {
      showError(`Maximum ${MAX_ATTACHMENTS} pièces jointes`);
    }
    if (toUpload.length === 0) return;

    setUploading(true);
    await Promise.allSettled(
      toUpload.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('entity_type', entityType!);
        formData.append('entity_id', String(entityId));

        const res = await fetch('/api/attachments/add', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const { attachment } = await res.json();
          setLiveSaved((prev) => [...prev, attachment]);
          onAttachmentsChange?.();
        } else {
          const body = await res.json().catch(() => ({}));
          showError(body?.error ?? "Erreur lors de l'upload");
        }
      }),
    );
    setUploading(false);
  };

  const handleRemovePending = (index: number) => {
    const next = pendingFiles.filter((_, i) => i !== index);
    setPendingFiles(next);
    onPendingFilesChange?.(next);
  };

  const handleDeleteSaved = async (attachmentId: number) => {
    setDeletingId(attachmentId);
    try {
      const res = await fetch('/api/attachments/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachment_id: attachmentId }),
      });

      if (res.ok) {
        setLiveSaved((prev) => prev.filter((a) => a.id !== attachmentId));
        onAttachmentsChange?.();
      } else {
        const body = await res.json().catch(() => ({}));
        showError(body?.error ?? 'Erreur lors de la suppression');
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <AttachmentGallery
        savedAttachments={isEditMode ? liveSaved : savedAttachments}
        pendingFiles={isEditMode ? [] : pendingFiles}
        onDeleteSaved={handleDeleteSaved}
        onRemovePending={handleRemovePending}
        isOwner={isOwner}
        deletingId={deletingId}
      />
      {isOwner && (
        <AttachmentUploader
          onFilesSelected={handleFilesSelected}
          disabled={uploading}
          uploading={uploading}
          maxFiles={MAX_ATTACHMENTS}
          currentCount={currentCount}
        />
      )}
    </div>
  );
}
