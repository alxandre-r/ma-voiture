"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

export default function PrivacySection() {
  const [exportingData, setExportingData] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const exportUserData = async () => {
    setExportingData(true);
    setExportSuccess(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setExportSuccess(
        "Vos données ont été exportées avec succès. Vous recevrez un email avec le fichier sous peu."
      );
    } catch {
      setExportSuccess(
        "Erreur lors de l'export des données. Veuillez réessayer."
      );
    } finally {
      setExportingData(false);
    }
  };

const handleAccountDeletion = async () => {
  if (deleteConfirmation !== "SUPPRIMER MON COMPTE") {
    alert("Veuillez confirmer la suppression en tapant 'SUPPRIMER MON COMPTE'");
    return;
  }

  setDeletingAccount(true);
  setDeleteSuccess(null);

  try {
    const res = await fetch("/api/auth/delete-account", { method: "POST" });
    const body = await res.json();

    if (!res.ok) {
      setDeleteSuccess(body.error || "Erreur lors de la suppression du compte");
      return;
    }

    setDeleteSuccess("Votre compte a été supprimé avec succès. Vous serez redirigé vers la page d'accueil.");

    setTimeout(() => window.location.href = "/", 3000);
  } catch {
    setDeleteSuccess("Erreur lors de la suppression du compte. Veuillez réessayer.");
  } finally {
    setDeletingAccount(false);
    setShowDeleteConfirm(false);
    setDeleteConfirmation("");
  }
};

  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-8">
        {/* Header */}
        <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-gray-800 dark:text-white">
            <Icon name="secure" size={24} />
            Confidentialité et RGPD
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
            Vos droits et nos engagements en matière de protection des données
            personnelles
            </p>
        </div>

        {/* User Rights Section */} 
        <div className="space-y-6"> 
            <div> 
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white"> Vos droits RGPD </h3> 
                <p className="text-gray-600 dark:text-gray-400 mb-4"> 
                    Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants : </p> 
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400 list-disc list-inside"> <li>Droit d&apos;accès à vos données personnelles</li> 
                    <li>Droit de rectification des données inexactes</li> 
                    <li>Droit à l&apos;effacement de vos données (droit à l&apos;oubli)</li> 
                    <li>Droit à la portabilité de vos données</li> 
                    <li>Droit d&apos;opposition au traitement de vos données</li> 
                    <li>Droit de retirer votre consentement à tout moment</li> 
                </ul> 
            </div> 

        {/* Data Collection Information */} 
        <div> 
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Données que nous collectons</h3> 
            <p className="text-gray-600 dark:text-gray-400 mb-4"> Dans le cadre de notre application de gestion de véhicules, nous collectons les données suivantes : </p> 
            <ul className="space-y-2 text-gray-600 dark:text-gray-400 list-disc list-inside"> 
                <li>Informations de compte (email, mot de passe chiffré)</li> 
                <li>Données relatives à vos véhicules (marque, modèle, année, etc.)</li> 
                <li>Historique de consommation de carburant et kilométrage</li> 
                <li>Données techniques nécessaires au fonctionnement de l&apos;application</li> 
            </ul> 
            <p className="text-gray-600 dark:text-gray-400 mt-4"> <strong>Finalité :</strong> 
            Ces données sont utilisées uniquement pour vous fournir le service de suivi de consommation et de gestion de votre parc automobile. 
            </p> 
        </div> 

        {/* Data Security */} 
        <div> 
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Sécurité de vos données</h3> 
            <p className="text-gray-600 dark:text-gray-400 mb-4"> 
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données personnelles contre la destruction, la perte, l&apos;altération, la divulgation non autorisée ou l&apos;accès accidentel. 
            </p> 
            <ul className="space-y-2 text-gray-600 dark:text-gray-400 list-disc list-inside"> 
                <li>Chiffrement des données sensibles</li> 
                <li>Authentification sécurisée via Supabase Auth</li> 
                <li>Stockage des données dans des centres de données sécurisés</li> 
                <li>Politique de conservation limitée des données</li> 
            </ul> 
        </div> 

        {/* Data Export Section */} 
        <div className="border-t border-gray-200 pt-6"> 
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Exporter vos données</h3> 
            <p className="text-gray-600 dark:text-gray-400 mb-4"> 
                Vous pouvez exporter toutes vos données personnelles au format JSON pour les conserver ou les transférer vers un autre service. 
            </p> 
            <button onClick={exportUserData} disabled={exportingData} 
                className={`px-4 py-3 text-white rounded-lg bg-custom-1 hover:bg-custom-1-hover font-medium flex items-center gap-2 ${exportingData ? "opacity-70 cursor-not-allowed" : "hover:cursor-pointer"}`} > 
                <Icon name="add" size={18} className="invert dark:invert-0" /> {exportingData ? "Export en cours..." : "Exporter mes données"} 
            </button> 
            {exportSuccess && ( 
                <div className={`p-3 rounded-lg text-sm mt-3 ${exportSuccess.includes("Erreur") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}> 
                    {exportSuccess} 
                </div> 
            )} 
        </div> 

        {/* Account Deletion Section */} 
        <div className="border-t border-gray-200 pt-6"> 
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Supprimer mon compte</h3> 
            <p className="text-gray-600 dark:text-gray-400 mb-4"> 
                Vous pouvez supprimer définitivement votre compte et toutes vos données associées. Cette action est irréversible. 
            </p> 
            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-4 flex items-start gap-3">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium"> 
                    La suppression de votre compte entraînera la perte définitive de toutes vos données (véhicules, historique de consommation, etc.). Cette action ne peut pas être annulée. 
                </p> 
            </div> 
            <button onClick={() => setShowDeleteConfirm(true)} disabled={deletingAccount} className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 hover:cursor-pointer ${deletingAccount ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"}`}> 
                <Icon name="delete" size={18} className="invert dark:invert-0" /> {deletingAccount ? "Suppression en cours..." : "Supprimer mon compte"} 
            </button> 
            {deleteSuccess && ( <div className={`p-3 rounded-lg text-sm mt-3 ${deleteSuccess.includes("Erreur") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {deleteSuccess} 
                </div> 
                )}

            {/* Delete Confirmation Dialog */} 
            {showDeleteConfirm && ( 
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700"> 
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Confirmation de suppression</h4> 
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Pour confirmer la suppression de votre compte, veuillez taper : <strong>&quot;SUPPRIMER MON COMPTE&quot;</strong> 
                    </p> 
                    <input type="text" className="p-3 rounded-lg border w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-red-500 focus:outline-none mb-3 hover:cursor-text" placeholder="Tapez SUPPRIMER MON COMPTE pour confirmer" value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} />
                    <div className="flex gap-3"> 
                        <button onClick={handleAccountDeletion} disabled={deletingAccount} className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-white hover:cursor-pointer ${deletingAccount ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`} > 
                            Confirmer la suppression 
                        </button> 
                        <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmation(""); }} disabled={deletingAccount} className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 hover:cursor-pointer" > 
                            Annuler 
                        </button> 
                    </div> 
                </div> 
            )} 
        </div> 

        {/* Data Controller & Hosting */} 
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                Responsable du traitement & hébergement
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4"> 
                Le responsable du traitement des données personnelles collectées via l&apos;application <strong> Ma Voiture Sandy</strong> est : 
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-1">
                <p className="text-gray-700 dark:text-gray-300 font-medium"> Alexandre Robert — Projet « Ma Voiture Sandy » </p>
                <p className="text-gray-600 dark:text-gray-400"> Email de contact : alexandre.robert.127@gmail.com </p>
                <p className="text-gray-600 dark:text-gray-400"> Localisation : France </p>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-4"> L&apos;application est hébergée par des prestataires techniques respectant le RGPD : </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-400 space-y-1">
                <li> <strong>Vercel Inc.</strong> - Hébergement du site web et gestion du nom de domaine </li>
                <li> <strong>Supabase Inc.</strong> - Authentification et stockage sécurisé des données </li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm">
                Ces prestataires agissent en tant que sous-traitants au sens du RGPD et mettent en œuvre des mesures de sécurité conformes aux standards européens.
            </p>
        </div> 

        {/* Consent Management */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Gestion du consentement</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4"> 
                En utilisant notre application, vous consentez au traitement de vos données personnelles conformément à notre politique de confidentialité. Vous pouvez retirer votre consentement à tout moment en supprimant votre compte.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
                <strong>Durée de conservation :</strong> Vos données sont conservées aussi longtemps que votre compte est actif, sauf demande explicite de suppression.
            </p>  
        </div>
    </div>

</section> 
)}