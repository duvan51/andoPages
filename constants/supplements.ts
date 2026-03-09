
export interface Supplement {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: string;
    matchingTreatments: string[]; // IDs de tratamientos que este suplemento acompaña
}

export const SUPPLEMENTS: Supplement[] = [
    {
        id: "multivitaminico-pro",
        title: "Multivitamínico High Performance",
        description: "Cápsulas de alta biodisponibilidad para mantener los niveles nutricionales entre sesiones de sueroterapia.",
        imageUrl: "https://images.unsplash.com/photo-1584017947476-8367ad902401?auto=format&fit=crop&q=80&w=1000",
        price: "$85.000",
        matchingTreatments: ["sueroterapia", "mega-vitamina-c", "revitalizante"]
    },
    {
        id: "omega-arterial",
        title: "Omega-3 Pure Tech",
        description: "Ácidos grasos esenciales para apoyar la limpieza arterial después de una quelación.",
        imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a30724677?auto=format&fit=crop&q=80&w=1000",
        price: "$95.000",
        matchingTreatments: ["barrido-arterial"]
    },
    {
        id: "colageno-hidrolizado",
        title: "Colageno Gold Plus",
        description: "Coadyuvante ideal para tratamientos osteoarticulares y estéticos.",
        imageUrl: "https://images.unsplash.com/photo-1550572017-ed2302ca622c?auto=format&fit=crop&q=80&w=1000",
        price: "$120.000",
        matchingTreatments: ["facial-bioplasma", "suero-osteoarticular"]
    }
];
