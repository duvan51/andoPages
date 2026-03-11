
/**
 * Generates a WhatsApp URL with a pre-filled message for lead generation.
 * Format: Quiero agendar cita -- [Location] -- [Service Title] -- [Current Date]
 */
export const getWhatsAppLeadUrl = (options: {
    phoneNumber?: string,
    serviceTitle?: string,
    location?: string,
    customMessage?: string
}): string => {
    // Basic formatting: remove spaces and non-numeric chars except +
    const cleanPhone = (options.phoneNumber || "573000000000").replace(/[^\d+]/g, '');
    const today = new Date();
    const dateStr = today.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    let message = options.customMessage || 'Quiero agendar cita';

    const parts = [];
    if (options.location) parts.push(options.location);
    if (options.serviceTitle) parts.push(options.serviceTitle);
    parts.push(dateStr);

    const finalMessage = `${message} -- ${parts.join(' -- ')}`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalMessage)}`;
};

export const LOCATIONS = ['Bogotá', 'Villavicencio', 'Pereira'] as const;
export type Location = typeof LOCATIONS[number];
