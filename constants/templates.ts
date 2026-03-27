
export interface Template {
    id: string;
    name: string;
    business_type: 'medical' | 'fashion' | 'services' | 'fitness';
    description: string;
    primary_color: string;
    thumbnail?: string;
}

export const TEMPLATES: Template[] = [
    {
        id: 'medical-modern',
        name: 'Clínica Médica Moderna',
        business_type: 'medical',
        primary_color: '#10b981',
        description: 'Limpio y profesional. Ideal para medicina general y consultorios.'
    },
    {
        id: 'medical-dark',
        name: 'Estética & SPA Dark',
        business_type: 'medical',
        primary_color: '#d4af37',
        description: 'Elegante y lujoso. Tonos oscuros y dorados para centros de estética de alto nivel.'
    },
    {
        id: 'fashion-luxury',
        name: 'Moda Femenina Luxury',
        business_type: 'fashion',
        primary_color: '#0f172a',
        description: 'Minimalista con tipografía serif. Ideal para boutiques y alta costura.'
    },
    {
        id: 'fashion-streetwear',
        name: 'Streetwear / Industrial',
        business_type: 'fashion',
        primary_color: '#1e293b',
        description: 'Urbano y robusto. Perfecto para marcas de ropa masculina y estilo oversize.'
    },
    {
        id: 'fashion-vintage',
        name: 'Boutique Vintage',
        business_type: 'fashion',
        primary_color: '#9333ea',
        description: 'Colores pastel y vibras retro. Ideal para moda independiente y creativa.'
    },
    {
        id: 'services-clean',
        name: 'Servicios Corporativos',
        business_type: 'services',
        primary_color: '#2563eb',
        description: 'Versátil y serio. Para consultoras, abogados o empresas de servicios.'
    },
    {
        id: 'services-tech',
        name: 'Tech & Software',
        business_type: 'services',
        primary_color: '#06b6d4',
        description: 'Futurista con acentos neón. Para agencias digitales y startups.'
    },
    {
        id: 'fitness-pro',
        name: 'Gimnasio & Fitness',
        business_type: 'fitness',
        primary_color: '#f97316',
        description: 'Enérgico y dinámico. Colores vibrantes para centros deportivos.'
    }
];
