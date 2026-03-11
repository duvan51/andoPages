-- Insert the new campaign landing page
INSERT INTO landings (slug, title, is_active, config)
VALUES (
    'landing-ventas-campanha',
    'Alternativa de Salud Real',
    true,
    '{
        "hero": {
            "title": "Descubre una alternativa científica para tratar el origen de tu enfermedad en Pereira",
            "subtitle": "Medicina Funcional e Integral: No más pañitos de agua tibia. Recupera tu vitalidad con un diagnóstico 360°",
            "imageUrl": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070",
            "ctaText": "¡Quiero mi Diagnóstico 360°!"
        },
        "pas": {
            "title": "¿Cansado de tratar solo los síntomas?",
            "problem1": {
                "text": "🛑 Fatiga crónica y falta de energía diaria",
                "image": "https://images.unsplash.com/photo-1541480601022-23057d163484?auto=format&fit=crop&q=80&w=1000"
            },
            "problem2": {
                "text": "🛑 Mala circulación y pesadez constante",
                "image": "https://images.unsplash.com/photo-1559839734-2b71f1e3c770?auto=format&fit=crop&q=80&w=1000"
            },
            "problem3": {
                "text": "🛑 Dolores que no desaparecen con pastillas comunes",
                "image": "https://images.unsplash.com/photo-1519011985187-444d62641929?auto=format&fit=crop&q=80&w=1000"
            }
        },
        "solutions": [
            {
                "title": "Analizador Cuántico",
                "text": "Conoce el estado de tus órganos sin agujas ni dolor. Un diagnóstico no invasivo de alta tecnología.",
                "image": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000"
            },
            {
                "title": "Consulta Especializada",
                "text": "Escucha médica real de 40 minutos (no 15 como en la EPS). Nos tomamos el tiempo de entender tu historia.",
                "image": "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1000"
            },
            {
                "title": "Plan Personalizado",
                "text": "Sueros y suplementación funcional pensada solo en ti y en las necesidades de tu organismo.",
                "image": "https://images.unsplash.com/photo-1631815541552-4c1082052ed3?auto=format&fit=crop&q=80&w=1000"
            }
        ],
        "socialProof": {
            "testimonials": [
                {
                    "name": "María G.",
                    "text": "Llevaba años con dolores lumbares y en Promedid encontré la solución definitiva."
                },
                {
                    "name": "Ricardo M.",
                    "text": "Gracias al diagnóstico cuántico entendí por fin por qué vivía tan cansado."
                },
                {
                    "name": "Elena P.",
                    "text": "Excelente atención y resultados reales. El plan de sueros me cambió la vida."
                }
            ],
            "logos": [
                "https://res.cloudinary.com/demo/image/upload/v1631234567/medical-seal.png",
                "https://res.cloudinary.com/demo/image/upload/v1631234568/icono-building.png"
            ]
        },
        "cta": {
            "urgencyText": "⚠️ Cupos limitados para esta semana: Solo atendemos 15 pacientes nuevos por semana.",
            "finalCtaText": "Chatear con un especialista ahora"
        },
        "styles": {
            "heroAlignment": "left",
            "pasAlignment": "center",
            "solutionAlignment": "left",
            "ctaAlignment": "center",
            "heroTitleSize": {"mobile": "2rem", "desktop": "3.5rem"},
            "heroButtonSize": {"mobile": "1.1rem", "desktop": "1.2rem"}
        }
    }'
)
ON CONFLICT (slug) DO UPDATE 
SET title = EXCLUDED.title,
    config = EXCLUDED.config;
