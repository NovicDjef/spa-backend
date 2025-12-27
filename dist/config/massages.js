"use strict";
/**
 * Configuration des services de massage avec leurs prix AVANT taxes
 * Prix en dollars canadiens ($)
 * Les taxes (TPS 5% + TVQ 9.975%) seront calculées automatiquement
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAX_RATES = exports.MASSAGE_SERVICES = void 0;
exports.calculateTaxes = calculateTaxes;
exports.getMassagePrice = getMassagePrice;
exports.getAvailableDurations = getAvailableDurations;
exports.MASSAGE_SERVICES = [
    {
        id: 'decouverte',
        name: 'Massage Découverte',
        pricing: {
            50: 103.00,
            80: 133.00,
        },
    },
    {
        id: 'therapeutique',
        name: 'Massage Thérapeutique',
        pricing: {
            50: 108.00,
            80: 138.00,
        },
    },
    {
        id: 'dos-nuque',
        name: 'Massage Dos & Nuque',
        pricing: {
            50: 108.00,
            80: 138.00,
        },
    },
    {
        id: 'sous-la-pluie',
        name: 'Massage Sous la Pluie',
        pricing: {
            50: 147.00,
        },
    },
    {
        id: 'flush-massage',
        name: 'Flush Massage',
        pricing: {
            50: 90.00,
        },
    },
    {
        id: 'kinesitherapie',
        name: 'Kinésithérapie',
        pricing: {
            50: 110.00,
            80: 142.00,
        },
    },
    {
        id: 'femme-enceinte',
        name: 'Massage Femme Enceinte',
        pricing: {
            50: 110.00,
            60: 140.00,
        },
    },
    {
        id: 'reiki',
        name: 'Reiki',
        pricing: {
            50: 110.00,
        },
    },
    {
        id: 'deep-tissue',
        name: 'Deep Tissue',
        pricing: {
            50: 128.00,
            80: 153.00,
        },
    },
];
/**
 * Taux de taxes au Québec
 */
exports.TAX_RATES = {
    TPS: 0.05, // 5% (taxe fédérale)
    TVQ: 0.09975, // 9.975% (taxe provinciale)
};
/**
 * Calcule les taxes et le total à partir d'un prix AVANT taxes
 * @param subtotal Prix AVANT taxes
 * @returns { subtotal, tps, tvq, total }
 */
function calculateTaxes(subtotal) {
    // Calculer les taxes individuelles
    const tps = subtotal * exports.TAX_RATES.TPS;
    const tvq = subtotal * exports.TAX_RATES.TVQ;
    // Calculer le total (prix + taxes)
    const total = subtotal + tps + tvq;
    return {
        subtotal: Math.round(subtotal * 100) / 100, // Arrondir à 2 décimales
        tps: Math.round(tps * 100) / 100,
        tvq: Math.round(tvq * 100) / 100,
        total: Math.round(total * 100) / 100,
    };
}
/**
 * Récupère le prix d'un massage en fonction du nom et de la durée
 * @param massageName Nom du massage
 * @param duration Durée en minutes
 * @returns Prix AVANT taxes ou null si non trouvé
 */
function getMassagePrice(massageName, duration) {
    const massage = exports.MASSAGE_SERVICES.find((m) => m.name.toLowerCase() === massageName.toLowerCase() ||
        m.id === massageName.toLowerCase());
    if (!massage) {
        return null;
    }
    return massage.pricing[duration] || null;
}
/**
 * Récupère toutes les durées disponibles pour un massage
 * @param massageName Nom du massage
 * @returns Array de durées disponibles
 */
function getAvailableDurations(massageName) {
    const massage = exports.MASSAGE_SERVICES.find((m) => m.name.toLowerCase() === massageName.toLowerCase() ||
        m.id === massageName.toLowerCase());
    if (!massage) {
        return [];
    }
    return Object.keys(massage.pricing).map(Number);
}
//# sourceMappingURL=massages.js.map