
-- Seed Data for Promedid Database

-- 1. DIAGNÓSTICO Y CONSULTA
INSERT INTO treatments (id, title, subtitle, description, category, tag, imageUrl, price, notes) 
VALUES ('analizador-cuantico', 'Analizador Cuántico', 'Escaneo Bioenergético', 'Escaneo no invasivo en 1 minuto. Analiza 30+ sistemas.', 'Diagnóstico', 'Diagnóstico', 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=1000', '$100.000', 'No apto para personas con marcapasos o mujeres embarazadas.');

INSERT INTO treatment_benefits (treatment_id, benefit) VALUES ('analizador-cuantico', 'No invasivo'), ('analizador-cuantico', 'Resultados en 1 min'), ('analizador-cuantico', 'Análisis de 30 sistemas');

INSERT INTO treatments (id, title, subtitle, description, category, tag, imageUrl, price) 
VALUES ('consulta-medica', 'Consulta Especializada', 'Enfoque Holístico', 'Evaluación médica profesional con enfoque en la medicina alternativa.', 'Diagnóstico', 'Consulta', 'https://images.unsplash.com/photo-1505751172107-160683050c56?auto=format&fit=crop&q=80&w=1000', '$150.000');

INSERT INTO treatment_benefits (treatment_id, benefit) VALUES ('consulta-medica', 'Diagnóstico profesional'), ('consulta-medica', 'Trata la raíz'), ('consulta-medica', 'Plan personalizado');

-- 2. SUEROTERAPIA - DETOX
INSERT INTO treatments (id, title, subtitle, description, category, subcategory, tag, imageUrl, price, packagePrice) 
VALUES ('barrido-arterial', 'Barrido Arterial', 'Quelación Endovenosa', 'Limpia arterias de grasa y metales pesados.', 'Sueroterapia', 'Detox', 'Cardiovascular', 'https://images.unsplash.com/photo-1579154235828-4519939f181d?auto=format&fit=crop&q=80&w=1000', '$190.000', 'Paquete x4: $680.000');

INSERT INTO treatment_benefits (treatment_id, benefit) VALUES ('barrido-arterial', 'Elimina metales pesados'), ('barrido-arterial', 'Limpia arterias'), ('barrido-arterial', 'Previene trombosis');

INSERT INTO treatments (id, title, subtitle, description, category, subcategory, tag, imageUrl, price) 
VALUES ('detox-basico', 'Detox Básico', 'Limpieza Extracelular', 'Elimina toxinas de la matriz extracelular.', 'Sueroterapia', 'Detox', 'Limpieza', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000', '$190.000');

INSERT INTO treatment_benefits (treatment_id, benefit) VALUES ('detox-basico', 'Activa drenaje linfático'), ('detox-basico', 'Elimina toxinas'), ('detox-basico', 'Mejora pH');

INSERT INTO treatments (id, title, subtitle, description, category, subcategory, tag, imageUrl, price) 
VALUES ('detox-avanzado', 'Detox Avanzado', 'Limpieza Profunda', 'Tratamiento intensivo de desintoxicación.', 'Sueroterapia', 'Detox', 'Limpieza PRO', 'https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?auto=format&fit=crop&q=80&w=1000', '$210.000');

INSERT INTO treatment_benefits (treatment_id, benefit) VALUES ('detox-avanzado', 'Máxima eliminación'), ('detox-avanzado', 'Vitalidad renovada'), ('detox-avanzado', 'Activa metabolismo');

-- 3. TERAPIAS MANUALES
INSERT INTO treatments (id, title, subtitle, description, category, tag, imageUrl, price) 
VALUES ('terapia-neural', 'Terapia Neural', 'Reparación Nerviosa', 'Inyecciones de dosis bajas para reparar el sistema nervioso.', 'Terapias', 'Dolor', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1000', '$120.000');

INSERT INTO treatment_benefits (treatment_id, benefit) VALUES ('terapia-neural', 'Repara nervios'), ('terapia-neural', 'Puntos de dolor'), ('terapia-neural', 'Efecto duradero');

-- SUPPLEMENTS
INSERT INTO supplements (id, title, description, imageUrl, price) 
VALUES ('multivitaminico-pro', 'Multivitamínico High Performance', 'Cápsulas para mantener los niveles nutricionales.', 'https://images.unsplash.com/photo-1584017947476-8367ad902401?auto=format&fit=crop&q=80&w=1000', '$85.000');

INSERT INTO supplement_matching (supplement_id, treatment_id) VALUES ('multivitaminico-pro', 'detox-basico'), ('multivitaminico-pro', 'detox-avanzado');

INSERT INTO supplements (id, title, description, imageUrl, price) 
VALUES ('omega-arterial', 'Omega-3 Pure Tech', 'Apoya la limpieza arterial.', 'https://images.unsplash.com/photo-1471864190281-a93a30724677?auto=format&fit=crop&q=80&w=1000', '$95.000');

INSERT INTO supplement_matching (supplement_id, treatment_id) VALUES ('omega-arterial', 'barrido-arterial');
