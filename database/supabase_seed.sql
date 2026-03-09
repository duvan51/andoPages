-- Seed Data for Supabase (Postgres)

-- 1. DIAGNÓSTICO Y CONSULTA
INSERT INTO treatments (id, title, subtitle, description, category, tag, "imageUrl", price, notes) 
VALUES ('analizador-cuantico', 'Analizador Cuántico', 'Escaneo Bioenergético', 'Escaneo no invasivo en 1 minuto. Analiza 30+ sistemas.', 'Diagnóstico', 'Diagnóstico', 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=1000', '$100.000', 'No apto para personas con marcapasos o mujeres embarazadas.');

INSERT INTO treatment_benefits (treatment_id, benefit) VALUES ('analizador-cuantico', 'No invasivo'), ('analizador-cuantico', 'Resultados en 1 min'), ('analizador-cuantico', 'Análisis de 30 sistemas');

INSERT INTO treatments (id, title, subtitle, description, category, tag, "imageUrl", price) 
VALUES ('consulta-medica', 'Consulta Especializada', 'Enfoque Holístico', 'Evaluación médica profesional con enfoque en la medicina alternativa.', 'Diagnóstico', 'Consulta', 'https://images.unsplash.com/photo-1505751172107-160683050c56?auto=format&fit=crop&q=80&w=1000', '$150.000');

INSERT INTO treatment_benefits (treatment_id, benefit) VALUES ('consulta-medica', 'Diagnóstico profesional'), ('consulta-medica', 'Trata la raíz'), ('consulta-medica', 'Plan personalizado');

-- 2. SUEROTERAPIA - DETOX
INSERT INTO treatments (id, title, subtitle, description, category, subcategory, tag, "imageUrl", price, "packagePrice") 
VALUES ('barrido-arterial', 'Barrido Arterial', 'Quelación Endovenosa', 'Limpia arterias de grasa y metales pesados.', 'Sueroterapia', 'Detox', 'Cardiovascular', 'https://images.unsplash.com/photo-1579154235828-4519939f181d?auto=format&fit=crop&q=80&w=1000', '$190.000', 'Paquete x4: $680.000');

INSERT INTO treatment_benefits (treatment_id, benefit) VALUES ('barrido-arterial', 'Elimina metales pesados'), ('barrido-arterial', 'Limpia arterias'), ('barrido-arterial', 'Previene trombosis');

INSERT INTO treatments (id, title, subtitle, description, category, subcategory, tag, "imageUrl", price) 
VALUES ('detox-basico', 'Detox Básico', 'Limpieza Extracelular', 'Elimina toxinas de la matriz extracelular.', 'Sueroterapia', 'Detox', 'Limpieza', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000', '$190.000');

INSERT INTO treatment_benefits (treatment_id, benefit) VALUES ('detox-basico', 'Activa drenaje linfático'), ('detox-basico', 'Elimina toxinas'), ('detox-basico', 'Mejora pH');

-- SUPPLEMENTS
INSERT INTO supplements (id, title, description, "imageUrl", price) 
VALUES ('multivitaminico-pro', 'Multivitamínico High Performance', 'Cápsulas para mantener los niveles nutricionales.', 'https://images.unsplash.com/photo-1584017947476-8367ad902401?auto=format&fit=crop&q=80&w=1000', '$85.000');

INSERT INTO supplement_matching (supplement_id, treatment_id) VALUES ('multivitaminico-pro', 'detox-basico');
