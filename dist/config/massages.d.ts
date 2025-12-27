/**
 * Configuration des services de massage avec leurs prix AVANT taxes
 * Prix en dollars canadiens ($)
 * Les taxes (TPS 5% + TVQ 9.975%) seront calculées automatiquement
 */
export interface MassagePricing {
    [duration: number]: number;
}
export interface MassageService {
    id: string;
    name: string;
    pricing: MassagePricing;
}
export declare const MASSAGE_SERVICES: MassageService[];
/**
 * Taux de taxes au Québec
 */
export declare const TAX_RATES: {
    TPS: number;
    TVQ: number;
};
/**
 * Calcule les taxes et le total à partir d'un prix AVANT taxes
 * @param subtotal Prix AVANT taxes
 * @returns { subtotal, tps, tvq, total }
 */
export declare function calculateTaxes(subtotal: number): {
    subtotal: number;
    tps: number;
    tvq: number;
    total: number;
};
/**
 * Récupère le prix d'un massage en fonction du nom et de la durée
 * @param massageName Nom du massage
 * @param duration Durée en minutes
 * @returns Prix AVANT taxes ou null si non trouvé
 */
export declare function getMassagePrice(massageName: string, duration: number): number | null;
/**
 * Récupère toutes les durées disponibles pour un massage
 * @param massageName Nom du massage
 * @returns Array de durées disponibles
 */
export declare function getAvailableDurations(massageName: string): number[];
//# sourceMappingURL=massages.d.ts.map