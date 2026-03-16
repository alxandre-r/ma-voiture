'use client';

import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle, CardRow } from '@/components/common/ui/card';
import Icon from '@/components/common/ui/Icon';
import ProfilePicture from '@/components/user/ProfilePicture';
import { useNotifications } from '@/contexts/NotificationContext';

import { ConfirmationModal } from '../common/ui/ConfirmationModal';

import type { Vehicle } from '@/types/vehicle';

interface VehicleOwner {
  user_id: string;
  user_name: string;
  avatar_url?: string | null;
}

interface VehicleDetailProps {
  vehicle: Vehicle;
  onBack: () => void;
  onEdit?: () => void;
  isFamilyVehicle?: boolean;
  owner?: VehicleOwner;
}

export default function VehicleDetail({
  vehicle,
  onBack,
  onEdit,
  isFamilyVehicle,
  owner,
}: VehicleDetailProps) {
  const { showSuccess, showError } = useNotifications();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Non renseignée';
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/vehicles/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle_id: vehicle.vehicle_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la suppression du véhicule');
      showSuccess('Véhicule supprimé avec succès !');
      router.refresh();
      onBack();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      showError(`❌ ${msg}`);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getFinancingModeLabel = (mode: string | null | undefined) => {
    switch (mode) {
      case 'lld':
        return 'LLD';
      case 'loa':
        return 'LOA';
      case 'owned':
        return 'Propriétaire';
      default:
        return '—';
    }
  };

  const vehicleImage = vehicle.image;
  const vehicleName = vehicle.name || (vehicle.make ? `${vehicle.make} ${vehicle.model}` : '');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition items-center flex 
            bg-white dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer"
          >
            <Icon name="arrow-back" size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              {vehicle.make} {vehicle.model}
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: vehicle.color || '#64748b' }}
              ></div>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">
              {vehicle.plate || 'Plaque non renseignée'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && !isFamilyVehicle && (
            <button
              onClick={onEdit}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:text-gray-700 hover:bg-gray-50 transition 
              dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-300
              items-center flex cursor-pointer bg-white "
            >
              <Icon name="edit" size={18} className="inline mr-2" />
              Modifier
            </button>
          )}
          {!isFamilyVehicle && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-red-600 hover:text-white hover:bg-red-600 transition
              dark:bg-gray-800 dark:border-gray-700 dark:text-red-500 dark:hover:bg-red-500 dark:hover:text-white
              items-center flex cursor-pointer bg-white group"
              disabled={deleting}
            >
              <Icon name="delete" size={18} className="inline mr-2 group-hover:invert" />
              Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Image & General informations - side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image */}
        <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden relative border border-gray-200 dark:border-gray-700 shadow-sm">
          {vehicleImage ? (
            <Image
              src={vehicleImage}
              alt={vehicle.model || 'Vehicle'}
              className="w-full h-full object-cover"
              fill
            />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
              <Icon name="car" size={64} className="text-gray-300 dark:text-gray-500" />
              <span className="text-gray-400 dark:text-gray-500 mt-2 text-sm">Aucune image</span>
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${vehicle.status === 'active' ? 'bg-emerald-500/50' : 'bg-gray-500/40'} backdrop-blur-sm`}
            >
              {vehicle.status === 'active' ? 'Actif' : 'Inactif'}
            </span>
          </div>

          {/* Owner badge - show for family vehicles */}
          {isFamilyVehicle && owner && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
              <ProfilePicture
                avatarUrl={owner.avatar_url}
                name={owner.user_name}
                size="sm"
                className="w-6 h-6"
              />
              <span className="text-xs font-medium text-gray-700 pr-1">{owner.user_name}</span>
            </div>
          )}
        </div>

        {/* General Information Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon name="settings" size={18} /> Informations Générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <CardRow label="Marque" value={vehicle.make || '—'} />
            <CardRow label="Modèle" value={vehicle.model || '—'} />
            <CardRow label="Année" value={vehicle.year || '—'} />
            <CardRow label="VIN" value={vehicle.vin || '—'} className="font-mono" />
            <CardRow label="Propriétaire" value={vehicle.owner_name || '—'} />
          </CardContent>
        </Card>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon name="tool" size={18} className="text-gray-500" /> Technique & Performances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <CardRow label="Carburant" value={vehicle.fuel_type || '—'} />
            <CardRow label="Transmission" value={vehicle.transmission || '—'} />
            <CardRow
              label="Kilométrage"
              value={vehicle.odometer?.toLocaleString() + ' km' || '—'}
            />
            <CardRow
              label="Consommation"
              value={
                vehicle.calculated_consumption
                  ? `${vehicle.calculated_consumption} L/100km`
                  : '— (calculée depuis les plein)'
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon name="secure" size={18} className="text-gray-500" /> Assurance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <CardRow label="Date de début" value={formatDate(vehicle.insurance_start_date)} />
            <CardRow
              label="Coût mensuel"
              value={
                vehicle.insurance_monthly_cost ? `${vehicle.insurance_monthly_cost} €/mois` : '—'
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon name="tool" size={18} className="text-gray-500" /> Entretien & Contrôle
              Technique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <CardRow label="Contrôle Technique" value={formatDate(vehicle.tech_control_expiry)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon name="euro" size={18} className="text-gray-500" /> Achat & Finance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <CardRow
              label="Mode de financement"
              value={getFinancingModeLabel(vehicle.financing_mode)}
            />
            <CardRow label="Date d'achat / contrat" value={formatDate(vehicle.purchase_date)} />
            <CardRow
              label={
                getFinancingModeLabel(vehicle.financing_mode) === 'Propriétaire'
                  ? "Prix d'achat"
                  : 'Loyer mensuel'
              }
              value={
                vehicle.purchase_price
                  ? `${vehicle.purchase_price.toLocaleString()} €`
                  : 'Non renseigné'
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer le véhicule "${vehicleName}" ? Cette action est irréversible.`}
        onConfirm={handleDelete}
        onClose={() => setShowDeleteConfirm(false)}
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonColor="red"
        isLoading={deleting}
      />
    </div>
  );
}
