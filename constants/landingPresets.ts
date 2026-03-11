
export const LANDING_PRESETS = [
    {
        id: 'medical_appointments',
        name: 'Citas Médicas / Salud',
        description: 'Ideal para clínicas, consultorios y servicios de salud. Enfoque en confianza y agendamiento.',
        icon: 'Stethoscope',
        config: {
            hero: {
                title: 'Tu Bienestar es nuestra Prioridad',
                subtitle: 'Accede a medicina integral de vanguardia con los mejores especialistas. Recupera tu vitalidad hoy mismo.',
                imageUrl: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?q=80&w=2070&auto=format&fit=crop',
                videoUrl: '',
                videoThumbnail: ''
            },
            pas: {
                title: '¿Te sientes identificado con esto?',
                problem1: '¿Sientes que tu energía no es la misma de antes?',
                problem2: '¿El estrés diario afecta tu rendimiento y descanso?',
                problem3: '¿Has probado de todo sin ver resultados reales?'
            },
            solutions: [
                {
                    title: 'Atención Médica Especializada',
                    text: 'Contamos con un equipo interdisciplinario que aborda tu salud desde la raíz, no solo los síntomas.',
                    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800'
                },
                {
                    title: 'Tratamientos de Vanguardia',
                    text: 'Implementamos protocolos médicos certificados y tecnología de última generación para tu recuperación.',
                    image: 'https://images.unsplash.com/photo-1576091160550-217359f49a4c?auto=format&fit=crop&q=80&w=800'
                }
            ],
            carousel: {
                images: [
                    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200',
                    'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200',
                    'https://images.unsplash.com/photo-1538108149393-fdfd81895907?q=80&w=1200'
                ],
                height: { mobile: '250px', desktop: '450px' }
            },
            pricing: {
                title: 'Planes y Precios',
                subtitle: 'Selecciona la opción que mejor se adapte a tus necesidades.',
                plans: [
                    { name: 'Consulta General', price: '120.000', features: ['Valoración inicial', 'Plan de tratamiento', 'Seguimiento por 15 días'], featured: false },
                    { name: 'Protocolo Integral', price: '450.000', features: ['3 Sesiones especializadas', 'Sueroterapia avanzada', 'Soporte 24/7', 'Exámenes incluidos'], featured: true, buttonText: '¡Lo quiero ya!' },
                    { name: 'Plan Familiar', price: '800.000', features: ['Atención para 4 personas', 'Check-up preventivo', 'Descuentos en farmacia'], featured: false }
                ]
            },
            faq: {
                title: 'Preguntas Frecuentes',
                subtitle: 'Resolvemos todas tus dudas antes de empezar.',
                items: [
                    { question: '¿Cuánto dura la primera sesión?', answer: 'La valoración inicial dura aproximadamente 45 a 60 minutos para un diagnóstico completo.' },
                    { question: '¿Aceptan seguros médicos?', answer: 'Trabajamos con las principales aseguradoras y también ofrecemos planes particulares competitivos.' },
                    { question: '¿Dónde están ubicados?', answer: 'Nuestra clínica principal está en el Edificio ICONO, Piso 4, con parqueadero privado para pacientes.' }
                ]
            },
            socialProof: {
                logosTitle: 'Nuestras Alianzas Médicas',
                testimonials: [
                    { name: 'Andrea M.', text: 'Excelente atención, los resultados se notan desde la primera sesión. Siento un cambio real.' },
                    { name: 'Ricardo G.', text: 'El equipo médico es muy profesional y las instalaciones son impecables. 100% recomendados.' }
                ],
                logos: [
                    'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_de_la_Organizaci%C3%B3n_Mundial_de_la_Salud.svg'
                ]
            },
            cta: {
                urgencyText: '⚠️ Quedan pocos cupos para esta semana',
                title: '¿Listo para transformar tu bienestar?',
                text: 'Solicita tu valoración inicial hoy y comienza tu camino a una vida más saludable.',
                formTitle: 'Tu camino inicia aquí',
                formSubtitle: 'Completa tus datos y un especialista te contactará en menos de 24 horas hábiles.',
                benefits: [
                    '✓ Consulta 100% personalizada',
                    '✓ Sin compromiso de permanencia',
                    '✓ Protocolos médicos certificados'
                ]
            },
            footer: {
                address: 'Edificio ICONO, Piso 4',
                phone: '+57 311 234 5678',
                email: 'contacto@empresa.com',
                description: 'Medicina Integral Avanzada al servicio de tu bienestar. Ubicados en el corazón de la ciudad.'
            },
            order: ['hero', 'pas', 'solutions', 'carousel', 'pricing', 'faq', 'socialProof', 'cta', 'footer'],
            visibility: {
                hero: true, pas: true, solutions: true, carousel: true, pricing: true, faq: true, socialProof: true, cta: true, footer: true, whatsapp: true
            },
            styles: {
                primaryColor: '#059669',
                heroAlignment: 'left'
            }
        }
    },
    {
        id: 'product_sale',
        name: 'Venta de Producto',
        description: 'Enfocado en destacar un producto físico, sus beneficios y facilitar la compra directa.',
        icon: 'ShoppingBag',
        config: {
            hero: {
                title: 'Potencia tu Vitalidad con Nuestra Fórmula',
                subtitle: 'El suplemento premium diseñado para optimizar tu rendimiento diario. Resultados garantizados o te devolvemos tu dinero.',
                imageUrl: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=2000&auto=format&fit=crop',
            },
            pas: {
                title: '¿Por qué nuestro suplemento es diferente?',
                problem1: 'Ingredientes 100% naturales y purificados.',
                problem2: 'Sin efectos secundarios ni aditivos químicos.',
                problem3: 'Fabricado bajo estrictos protocolos de calidad.'
            },
            solutions: [
                {
                    title: 'Ciencia Aplicada a tu Nutrición',
                    text: 'Nuestra fórmula ha sido testeada para mejorar la concentración, aumentar la energía y fortalecer el sistema inmune.',
                    image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?q=80&w=800&auto=format&fit=crop'
                }
            ],
            collage: {
                images: [
                    'https://images.unsplash.com/photo-1550573105-75864e39bc27?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=800&auto=format&fit=crop'
                ]
            },
            pricing: {
                title: 'Nuestros Packs Exclusivos',
                subtitle: 'Selecciona el tratamiento que mejor se adapte a tus objetivos.',
                plans: [
                    { name: 'Pack Individual', price: '85.000', features: ['1 Frasco (30 servicios)', 'Guía de uso digital', 'Envío estándar'], featured: false },
                    { name: 'Pack Duplo', price: '150.000', features: ['2 Frascos (Ahorro 20%)', 'Guía de uso digital', 'Envío GRATIS', 'Soporte nutricional'], featured: true, buttonText: '¡Aprovechar Oferta!' },
                    { name: 'Pack Trimestral', price: '210.000', features: ['3 Frascos', 'Plan de alimentación extra', 'Envío prioritario'], featured: false }
                ]
            },
            faq: {
                title: 'Preguntas Frecuentes',
                subtitle: 'Resolvemos tus dudas sobre el producto y el envío.',
                items: [
                    { question: '¿Cómo debo tomar el producto?', answer: 'Se recomienda una toma diaria por las mañanas con abundante agua.' },
                    { question: '¿Tienen envíos a todo el país?', answer: 'Sí, entregamos en toda Colombia entre 48 a 72 horas hábiles.' },
                    { question: '¿Tiene contraindicaciones?', answer: 'Es un suplemento natural, sin embargo recomendamos consultar a su médico si está en embarazo o lactancia.' }
                ]
            },
            socialProof: {
                logosTitle: 'Certificaciones y Calidad',
                testimonials: [
                    { name: 'Laura S.', text: 'Increíble, me siento con mucha más energía durante el día. Lo empecé a notar a la semana.' },
                    { name: 'Juan P.', text: 'El envío fue muy rápido y el producto superó mis expectativas. Volveré a comprar.' }
                ]
            },
            cta: {
                urgencyText: '🔥 ¡Últimas unidades con 20% de descuento!',
                title: 'Lleva el tuyo ahora',
                text: 'No pierdas la oportunidad de mejorar tu salud con esta oferta exclusiva por tiempo limitado.',
                formTitle: 'Realiza tu pedido',
                formSubtitle: 'Déjanos tus datos y un asesor te contactará para confirmar el envío.',
                benefits: [
                    '✓ Pago contra entrega disponible',
                    '✓ Garantía de satisfacción 30 días',
                    '✓ Asesoría personalizada incluida'
                ]
            },
            footer: {
                address: 'Bodega Principal, Zona Industrial',
                phone: '+57 300 000 0000',
                email: 'ventas@tusupplemento.com',
                description: 'Comprometidos con tu salud y bienestar natural. Calidad garantizada en cada proceso.'
            },
            order: ['hero', 'pas', 'solutions', 'collage', 'pricing', 'faq', 'socialProof', 'cta', 'footer'],
            visibility: {
                hero: true, pas: true, solutions: true, collage: true, pricing: true, faq: true, socialProof: true, cta: true, footer: true, whatsapp: true
            },
            styles: {
                primaryColor: '#2563eb',
                heroAlignment: 'center'
            }
        }
    },
    {
        id: 'service_inquiry',
        name: 'Prestación de Servicios',
        description: 'Ideal para agencias o consultores. Enfocado en autoridad, proceso y generación de leads.',
        icon: 'Briefcase',
        config: {
            hero: {
                title: 'Transformamos tu Visión en Resultados Reales',
                subtitle: 'Consultoría estratégica especializada en optimizar procesos y aumentar la rentabilidad de tu negocio.',
                imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2030&auto=format&fit=crop',
            },
            pas: {
                title: '¿Sientes que tu negocio tocó un techo?',
                problem1: '¿Operas sin un sistema predecible?',
                problem2: '¿Tu equipo pierde tiempo en tareas manuales?',
                problem3: '¿La rentabilidad no crece al ritmo que esperas?'
            },
            solutions: [
                {
                    title: 'Nuestra Metodología de Trabajo',
                    text: 'Analizamos, diseñamos y ejecutamos estrategias personalizadas que eliminan cuellos de botella y potencian tus ventas.',
                    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop'
                }
            ],
            pricing: {
                title: 'Inversión en tu Crecimiento',
                subtitle: 'Elegimos trabajar con proyectos donde podemos generar un impacto real.',
                plans: [
                    { name: 'Auditoría Inicial', price: '300.000', features: ['Análisis de situación', 'Reporte de oportunidades', 'Videollamada de 60 min'], featured: false },
                    { name: 'Plan de Crecimiento', price: '1.200.000', features: ['Acompañamiento mensual', 'Implementación de CRM', 'Optimización de pauta', 'Dashboards en tiempo real'], featured: true, buttonText: 'Agendar Sesión' },
                    { name: 'Consultoría Master', price: '3.500.000', features: ['Estrategia Full Stack', 'Reclutamiento de talento', 'Bonus: Entrenamiento de equipo'], featured: false }
                ]
            },
            faq: {
                title: 'Resolvemos tus Dudas',
                subtitle: 'Entendemos que cada negocio es único.',
                items: [
                    { question: '¿En cuánto tiempo veré resultados?', answer: 'Los primeros ajustes suelen dar resultados en las primeras 4 semanas de implementación.' },
                    { question: '¿Es para cualquier tipo de empresa?', answer: 'Nos especializamos en empresas de servicios y comercio digital con facturación recurrente.' }
                ]
            },
            socialProof: {
                logosTitle: 'Casos de Éxito',
                testimonials: [
                    { name: 'Empresa X', text: 'Logramos duplicar nuestros leads en tan solo 3 meses de trabajo conjunto. La claridad que nos dieron fue vital.' }
                ]
            },
            cta: {
                urgencyText: '📅 Solo 2 cupos disponibles para este mes',
                title: 'Reserva tu Consultoría Gratuita',
                text: 'Analizaremos tu caso por 15 minutos y te daremos un plan de acción, sin compromiso.',
                formTitle: 'Postula tu proyecto',
                formSubtitle: 'Cuéntanos qué necesitas y evaluaremos si somos el aliado correcto para ti.',
                benefits: [
                    '✓ Análisis previo de tu mercado',
                    '✓ Hoja de ruta estratégica',
                    '✓ Sin compromiso de contratación'
                ]
            },
            footer: {
                address: 'Oficina Central, Distrio de Innovación',
                phone: '+57 350 000 0000',
                email: 'hola@estrategia.com',
                description: 'Ayudamos a escalar negocios mediante procesos eficientes y marketing de resultados.'
            },
            order: ['hero', 'pas', 'solutions', 'pricing', 'faq', 'socialProof', 'cta', 'footer'],
            visibility: {
                hero: true, pas: true, solutions: true, pricing: true, faq: true, socialProof: true, cta: true, footer: true, whatsapp: true
            },
            styles: {
                primaryColor: '#7c3aed',
                heroAlignment: 'left'
            }
        }
    }
];
