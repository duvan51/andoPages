
export interface Treatment {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    category: 'Diagnóstico' | 'Sueroterapia' | 'Terapias' | 'Estética' | 'Multivitamínicos';
    subcategory?: string;
    tag: string;
    imageUrl: string;
    price: string;
    packagePrice?: string;
    benefits: string[];
    notes?: string;
    recommendedSupplements?: string[];
}

export const TREATMENTS: Treatment[] = [
    // 1. DIAGNÓSTICO Y CONSULTA
    {
        id: "analizador-cuantico",
        title: "Analizador Cuántico",
        subtitle: "Escaneo Bioenergético",
        description: "Escaneo no invasivo en 1 minuto. Analiza 30+ sistemas incluyendo cardiovascular, gastrointestinal, óseo y niveles vitamínicos.",
        category: "Diagnóstico",
        tag: "Diagnóstico",
        imageUrl: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=1000",
        price: "$100.000",
        benefits: ["No invasivo", "Resultados en 1 min", "Análisis de 30 sistemas"],
        notes: "No apto para personas con marcapasos o mujeres embarazadas."
    },
    {
        id: "consulta-medica",
        title: "Consulta Especializada",
        subtitle: "Enfoque Holístico",
        description: "Evaluación médica profesional con enfoque en la medicina alternativa para tratar la raíz de sus dolencias.",
        category: "Diagnóstico",
        tag: "Consulta",
        imageUrl: "https://images.unsplash.com/photo-1505751172107-160683050c56?auto=format&fit=crop&q=80&w=1000",
        price: "$150.000",
        benefits: ["Diagnóstico profesional", "Trata la raíz", "Plan personalizado"]
    },

    // 2. SUEROTERAPIA - DETOX
    {
        id: "barrido-arterial",
        title: "Barrido Arterial",
        subtitle: "Quelación Endovenosa",
        description: "Limpia arterias de grasa y metales pesados (plomo, calcio). Previene infartos, trombosis y venas várices.",
        category: "Sueroterapia",
        subcategory: "Detox",
        tag: "Cardiovascular",
        imageUrl: "https://images.unsplash.com/photo-1579154235828-4519939f181d?auto=format&fit=crop&q=80&w=1000",
        price: "$190.000",
        packagePrice: "Paquete x4: $680.000",
        benefits: ["Elimina metales pesados", "Limpia arterias", "Previene trombosis"]
    },
    {
        id: "detox-basico",
        title: "Detox Básico",
        subtitle: "Limpieza Extracelular",
        description: "Elimina toxinas de la matriz extracelular y activa el sistema de drenaje linfático natural.",
        category: "Sueroterapia",
        subcategory: "Detox",
        tag: "Limpieza",
        imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000",
        price: "$190.000",
        benefits: ["Activa drenaje linfático", "Elimina toxinas", "Mejora pH"]
    },
    {
        id: "detox-avanzado",
        title: "Detox Avanzado",
        subtitle: "Limpieza Profunda",
        description: "Tratamiento intensivo de desintoxicación para organismos con alta carga tóxica o fatiga crónica.",
        category: "Sueroterapia",
        subcategory: "Detox",
        tag: "Limpieza PRO",
        imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?auto=format&fit=crop&q=80&w=1000",
        price: "$210.000",
        benefits: ["Máxima eliminación", "Vitalidad renovada", "Activa metabolismo"]
    },

    // 2. SUEROTERAPIA - SISTEMAS
    {
        id: "suero-osteoarticular",
        title: "Osteoarticular",
        subtitle: "Regeneración Ósea",
        description: "Regeneración de tejido óseo, ideal para artritis, artrosis y hernias discales. Activa la producción natural de colágeno.",
        category: "Sueroterapia",
        subcategory: "Sistemas",
        tag: "Huesos y Artic.",
        imageUrl: "https://images.unsplash.com/photo-1559757175-5700dee835be?auto=format&fit=crop&q=80&w=1000",
        price: "$210.000",
        benefits: ["Regenera tejido", "Alivia Artritis", "Activa colágeno"]
    },
    {
        id: "suero-respiratorio",
        title: "Sistema Respiratorio",
        subtitle: "Prevención y Defensas",
        description: "Prevención de gripas, dengue y asma. Sube las defensas de forma inmediata.",
        category: "Sueroterapia",
        subcategory: "Sistemas",
        tag: "Respiratorio",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=1000",
        price: "$210.000",
        benefits: ["Sube defensas", "Previene gripas", "Mejora capacidad lung"]
    },
    {
        id: "suero-renal",
        title: "Sistema Renal",
        subtitle: "Vías Urinarias",
        description: "Tratamiento efectivo para infecciones recurrentes, cistitis y cálculos renales.",
        category: "Sueroterapia",
        subcategory: "Sistemas",
        tag: "Renal",
        imageUrl: "https://images.unsplash.com/photo-1559757175-013fe5099fbe?auto=format&fit=crop&q=80&w=1000",
        price: "$210.000",
        benefits: ["Limpia riñones", "Trata infecciones", "Elimina cálculos"]
    },
    {
        id: "suero-nervioso",
        title: "Sistema Nervioso",
        subtitle: "Paz y Equilibrio",
        description: "Tratamiento para estrés, depresión, insomnio y estados de miedo o ansiedad crónica.",
        category: "Sueroterapia",
        subcategory: "Sistemas",
        tag: "Nervioso",
        imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000",
        price: "$210.000",
        benefits: ["Reduce estrés", "Mejora sueño", "Controla ansiedad"]
    },
    {
        id: "acido-urico",
        title: "Ácido Úrico",
        subtitle: "Tratamiento de Gota",
        description: "Tratamiento específico para reducir niveles altos de ácido úrico y aliviar síntomas de gota.",
        category: "Sueroterapia",
        subcategory: "Sistemas",
        tag: "Metabólico",
        imageUrl: "https://images.unsplash.com/photo-1445038466367-10c717e156ff?auto=format&fit=crop&q=80&w=1000",
        price: "$220.000",
        packagePrice: "Paquete $790.000",
        benefits: ["Reduce ácido úrico", "Alivia inflamación", "Evita ataques"]
    },

    {
        id: "suero-digestivo",
        title: "Digestivo y Hepático",
        subtitle: "Salud Intestinal",
        description: "Ideal para colon irritable, gastritis, hígado graso y estreñimiento. Contiene Nuxvom y Epachel.",
        category: "Sueroterapia",
        subcategory: "Sistemas",
        tag: "Digestivo",
        imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000",
        price: "$210.000",
        benefits: ["Regula digestión", "Limpia hígado", "Reduce inflamación"]
    },
    {
        id: "mega-vitamina-c",
        title: "Mega Dosis Vitamina C",
        subtitle: "Inmunidad y Antioxidante",
        description: "Potente antioxidante que sube defensas, previene el envejecimiento y es coadyuvante en procesos oncológicos.",
        category: "Sueroterapia",
        subcategory: "Sistemas",
        tag: "Inmunología",
        imageUrl: "https://images.unsplash.com/photo-1579154236528-621d1d2931e5?auto=format&fit=crop&q=80&w=1000",
        price: "$190.000",
        benefits: ["Altas defensas", "Piel radiante", "Combate oxidación"]
    },
    {
        id: "potencializador-masculino",
        title: "Vigor Masculino",
        subtitle: "Energía y Vitalidad",
        description: "Trata impotencia viril, eyaculación precoz y agotamiento físico/mental. Recupera tu rendimiento.",
        category: "Sueroterapia",
        subcategory: "Bienestar",
        tag: "Salud Hombre",
        imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1000",
        price: "$260.000",
        packagePrice: "Paquete x4: $950.000",
        benefits: ["Mayor rendimiento", "Energía vital", "Fuerza física"]
    },

    // BIENESTAR Y BELLEZA
    {
        id: "antienvejecimiento",
        title: "Antienvejecimiento",
        subtitle: "Fundamental y Especial",
        description: "Revitaliza piel, cabello y uñas. Retrasa los procesos degenerativos naturales del cuerpo.",
        category: "Sueroterapia",
        subcategory: "Bienestar",
        tag: "Belleza",
        imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?auto=format&fit=crop&q=80&w=1000",
        price: "$190.000",
        benefits: ["Retrasa vejez", "Piel radiante", "Salud capilar"]
    },
    {
        id: "revitalizante",
        title: "Revitalizante",
        subtitle: "Energía Vital",
        description: "Mejora la fatiga crónica, el estado anímico y recupera la energía vital perdida por el estrés diario.",
        category: "Sueroterapia",
        subcategory: "Bienestar",
        tag: "Vitalidad",
        imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1000",
        price: "$210.000",
        benefits: ["Combate fatiga", "Mejora ánimo", "Energía diaria"]
    },
    {
        id: "obesidad-metabolismo",
        title: "Obesidad y Metabolismo",
        subtitle: "Control de Peso",
        description: "Acelera la quema de grasa y regula el metabolismo para una pérdida de peso saludable.",
        category: "Sueroterapia",
        subcategory: "Bienestar",
        tag: "Metabolismo",
        imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1000",
        price: "$210.000",
        benefits: ["Quema grasa", "Regula apetito", "Acelera metabolismo"]
    },

    // TERAPIAS EXTRAS
    {
        id: "biopuntura",
        title: "Biopuntura",
        subtitle: "Inyección Homeopática",
        description: "Inyecciones de productos homeopáticos en puntos específicos para una curación natural y focalizada.",
        category: "Terapias",
        tag: "Biorregulación",
        imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?auto=format&fit=crop&q=80&w=1000",
        price: "$120.000",
        benefits: ["Focalizado", "Homeopático", "Reparación natural"]
    },
    {
        id: "inmunoregulador",
        title: "Inmunoregulador",
        subtitle: "Refuerzo Potente",
        description: "Refuerzo intensivo del sistema inmune para pacientes con defensas severamente comprometidas.",
        category: "Sueroterapia",
        subcategory: "Especializados",
        tag: "Inmunidad",
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000",
        price: "$210.000",
        benefits: ["Escudo protector", "Respuesta rápida", "Salud total"]
    },
    // 3. TERAPIAS MANUALES
    {
        id: "quiropraxia",
        title: "Quiropraxia Profesional",
        subtitle: "Alineación Vertebral",
        description: "Ajuste manual de columna para liberar pinzamientos nerviosos, dolor de espalda y ciática.",
        category: "Terapias",
        tag: "Columna",
        imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=1000",
        price: "Incluido en Paquetes",
        benefits: ["Libera nervios", "Alivio de ciática", "Mejora postura"]
    },
    {
        id: "terapia-neural",
        title: "Terapia Neural",
        subtitle: "Reparación Nerviosa",
        description: "Inyecciones de dosis bajas para reparar el sistema nervioso y tratar el dolor crónico de forma efectiva.",
        category: "Terapias",
        tag: "Dolor",
        imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1000",
        price: "$120.000",
        benefits: ["Repara nervios", "Puntos de dolor", "Efecto duradero"]
    },
    {
        id: "detox-ionico-pedi",
        title: "Detox Iónico",
        subtitle: "Limpieza por Pediluvio",
        description: "Limpieza de toxinas a través de los poros de los pies, equilibrando el pH y promoviendo la relajación.",
        category: "Terapias",
        tag: "Limpieza",
        imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000",
        price: "$60.000",
        packagePrice: "Paquete x4: $200.000",
        benefits: ["Elimina metales", "Equilibra pH", "Sensación de ligereza"]
    },
    {
        id: "facial-bioplasma",
        title: "Facial + Bioplasma",
        subtitle: "Regeneración Estética",
        description: "Tratamiento estético regenerativo para una piel más joven, hidratada y con brillo natural.",
        category: "Estética",
        tag: "Belleza",
        imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=1000",
        price: "$150.000",
        benefits: ["Regenera piel", "Hidratación profunda", "Efecto lifting"]
    }
];
