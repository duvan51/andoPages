const DEFAULT_GEMINI_KEY = (process.env.GEMINI_API_KEY || process.env.API_KEY || '').trim();

export interface GeminiProductResponse {
  title: string;
  description: string;
  category: string;
  price: number;
  cost_price?: number;
  pauta_price?: number;
  sku?: string;
  product_type: 'product' | 'service';
  variants?: {
    size: string;
    color: string;
    stock: number;
  }[];
  benefits?: string[];
  components?: {
    name: string;
    desc: string;
  }[];
  assistantMessage: string;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  parts: {
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }[];
}

// Obtener las claves configuradas desde localStorage o defaults
export function getAIConfig(): { provider: 'gemini' | 'openai' | 'openrouter'; apiKey: string; model?: string } {
  const provider = (localStorage.getItem('andopages_ai_provider') || 'gemini') as 'gemini' | 'openai' | 'openrouter';
  const apiKey = localStorage.getItem('andopages_ai_key') || (provider === 'gemini' ? DEFAULT_GEMINI_KEY : '');
  const model = localStorage.getItem('andopages_ai_model') || (provider === 'openrouter' ? 'google/gemini-2.5-flash' : '');
  return { provider, apiKey, model };
}

// Guardar configuración en localStorage
export function saveAIConfig(provider: 'gemini' | 'openai' | 'openrouter', apiKey: string, model?: string) {
  localStorage.setItem('andopages_ai_provider', provider);
  localStorage.setItem('andopages_ai_key', apiKey.trim());
  if (model) {
    localStorage.setItem('andopages_ai_model', model.trim());
  }
}

export async function analyzeProductWithAI(
  prompt: string,
  imageBase64?: string,
  imageMimeType?: string,
  history: ChatMessage[] = []
): Promise<GeminiProductResponse> {
  const { provider, apiKey, model } = getAIConfig();

  if (!apiKey) {
    throw new Error(
      `La API Key para ${provider === 'gemini' ? 'Gemini' : provider === 'openai' ? 'OpenAI' : 'OpenRouter'} no está configurada. Por favor, haz clic en el ícono de ajustes en el asistente para configurarla.`
    );
  }

  if (provider === 'gemini') {
    return analyzeWithGemini(prompt, apiKey, imageBase64, imageMimeType, history);
  } else if (provider === 'openai') {
    return analyzeWithOpenAI(prompt, apiKey, imageBase64, imageMimeType, history);
  } else {
    return analyzeWithOpenRouter(prompt, apiKey, model, imageBase64, imageMimeType, history);
  }
}

// --- LLAMADA A GEMINI API ---
async function analyzeWithGemini(
  prompt: string,
  apiKey: string,
  imageBase64?: string,
  imageMimeType?: string,
  history: ChatMessage[] = []
): Promise<GeminiProductResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // Formatear historia mapeando 'assistant' de OpenAI a 'model' en Gemini si es necesario
  const contents = history.map(item => ({
    role: item.role === 'assistant' ? 'model' : item.role,
    parts: item.parts
  }));

  const newParts: any[] = [];
  if (prompt) {
    newParts.push({ text: prompt });
  }
  if (imageBase64 && imageMimeType) {
    newParts.push({
      inlineData: {
        mimeType: imageMimeType,
        data: imageBase64,
      },
    });
  }

  if (newParts.length > 0) {
    contents.push({
      role: 'user',
      parts: newParts,
    });
  }

  const responseSchema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING', description: 'Nombre recomendado para el producto, claro y comercial.' },
      description: { type: 'STRING', description: 'Descripción comercial en formato Markdown del producto.' },
      category: { type: 'STRING', description: 'Categoría sugerida (ej: Ropa, Calzado, Tecnología).' },
      price: { type: 'STRING', description: 'Precio de venta recomendado.' },
      cost_price: { type: 'NUMBER', description: 'Precio de costo del producto.' },
      pauta_price: { type: 'NUMBER', description: 'Precio de venta pauta (publicidad/promoción) recomendado.' },
      sku: { type: 'STRING', description: 'Código SKU sugerido.' },
      product_type: { type: 'STRING', enum: ['product', 'service'], description: 'Tipo de ítem (product o service).' },
      variants: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            size: { type: 'STRING' },
            color: { type: 'STRING' },
            stock: { type: 'NUMBER' }
          },
          required: ['size', 'stock']
        }
      },
      benefits: {
        type: 'ARRAY',
        items: { type: 'STRING' }
      },
      components: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            desc: { type: 'STRING' }
          },
          required: ['name', 'desc']
        }
      },
      assistantMessage: {
        type: 'STRING',
        description: 'Mensaje de texto libre en español que el asistente envía al usuario en el chat.'
      }
    },
    required: ['title', 'description', 'category', 'price', 'product_type', 'assistantMessage']
  };

  const body = {
    contents,
    systemInstruction: {
      parts: [
        {
          text: `Eres un asistente experto en e-commerce y marketing digital para la plataforma andoPages.
Tu tarea es ayudar al administrador a agregar, describir y optimizar productos de su catálogo.
Siempre debes responder usando el JSON estructurado solicitado. En la propiedad 'assistantMessage', incluye la respuesta conversacional en texto libre que se le mostrará al usuario en el chat.`
        }
      ]
    },
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.2
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
  }

  const result = await response.json();
  const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) throw new Error('No se recibió respuesta del modelo Gemini.');

  return JSON.parse(textResponse);
}

// --- LLAMADA A OPENAI API ---
async function analyzeWithOpenAI(
  prompt: string,
  apiKey: string,
  imageBase64?: string,
  imageMimeType?: string,
  history: ChatMessage[] = []
): Promise<GeminiProductResponse> {
  const url = 'https://api.openai.com/v1/chat/completions';

  // Formatear la historia para OpenAI
  const messages: any[] = [
    {
      role: 'system',
      content: `Eres un asistente experto en e-commerce y marketing digital para la plataforma andoPages.
Tu tarea es ayudar al administrador a agregar, describir y optimizar productos de su catálogo.
Debes responder estructuradamente de acuerdo al esquema JSON indicado. En la propiedad 'assistantMessage', incluye tu respuesta amigable y explicativa en español.`
    }
  ];

  // Mapear historial
  history.forEach(item => {
    const role = item.role === 'model' ? 'assistant' : item.role;
    
    // Mapear partes
    const contentsList: any[] = [];
    item.parts.forEach(part => {
      if (part.text) {
        contentsList.push({ type: 'text', text: part.text });
      }
      if (part.inlineData) {
        contentsList.push({
          type: 'image_url',
          image_url: {
            url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
          }
        });
      }
    });

    if (contentsList.length > 0) {
      messages.push({ role, content: contentsList });
    }
  });

  // Agregar el mensaje actual del usuario
  const currentUserContent: any[] = [];
  if (prompt) {
    currentUserContent.push({ type: 'text', text: prompt });
  }
  if (imageBase64 && imageMimeType) {
    currentUserContent.push({
      type: 'image_url',
      image_url: {
        url: `data:${imageMimeType};base64,${imageBase64}`
      }
    });
  }

  if (currentUserContent.length > 0) {
    messages.push({ role: 'user', content: currentUserContent });
  }

  const jsonSchema = {
    name: 'product_data',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        price: { type: 'number' },
        cost_price: { type: 'number' },
        pauta_price: { type: 'number' },
        sku: { type: 'string' },
        product_type: { type: 'string', enum: ['product', 'service'] },
        variants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              size: { type: 'string' },
              color: { type: 'string' },
              stock: { type: 'number' }
            },
            required: ['size', 'color', 'stock'],
            additionalProperties: false
          }
        },
        benefits: {
          type: 'array',
          items: { type: 'string' }
        },
        components: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              desc: { type: 'string' }
            },
            required: ['name', 'desc'],
            additionalProperties: false
          }
        },
        assistantMessage: { type: 'string' }
      },
      required: [
        'title',
        'description',
        'category',
        'price',
        'cost_price',
        'pauta_price',
        'sku',
        'product_type',
        'variants',
        'benefits',
        'components',
        'assistantMessage'
      ],
      additionalProperties: false
    }
  };

  const body = {
    model: 'gpt-4o-mini',
    messages,
    response_format: {
      type: 'json_schema',
      json_schema: jsonSchema
    },
    temperature: 0.2
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API Error: ${response.status} - ${errText}`);
  }

  const result = await response.json();
  const textResponse = result.choices?.[0]?.message?.content;
  if (!textResponse) throw new Error('No se recibió respuesta del modelo OpenAI.');

  return JSON.parse(textResponse);
}

// --- LLAMADA A OPENROUTER API ---
async function analyzeWithOpenRouter(
  prompt: string,
  apiKey: string,
  modelName: string = 'google/gemini-2.5-flash',
  imageBase64?: string,
  imageMimeType?: string,
  history: ChatMessage[] = []
): Promise<GeminiProductResponse> {
  const url = 'https://openrouter.ai/api/v1/chat/completions';

  // Formatear la historia para OpenRouter
  const messages: any[] = [
    {
      role: 'system',
      content: `Eres un asistente experto en e-commerce y marketing digital para la plataforma andoPages.
Tu tarea es ayudar al administrador a agregar, describir y optimizar productos de su catálogo.
Debes responder estructuradamente de acuerdo al esquema JSON indicado. En la propiedad 'assistantMessage', incluye tu respuesta amigable y explicativa en español.`
    }
  ];

  // Mapear historial
  history.forEach(item => {
    const role = item.role === 'model' ? 'assistant' : item.role;
    
    // Mapear partes
    const contentsList: any[] = [];
    item.parts.forEach(part => {
      if (part.text) {
        contentsList.push({ type: 'text', text: part.text });
      }
      if (part.inlineData) {
        contentsList.push({
          type: 'image_url',
          image_url: {
            url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
          }
        });
      }
    });

    if (contentsList.length > 0) {
      messages.push({ role, content: contentsList });
    }
  });

  // Agregar el mensaje actual del usuario
  const currentUserContent: any[] = [];
  if (prompt) {
    currentUserContent.push({ type: 'text', text: prompt });
  }
  if (imageBase64 && imageMimeType) {
    currentUserContent.push({
      type: 'image_url',
      image_url: {
        url: `data:${imageMimeType};base64,${imageBase64}`
      }
    });
  }

  if (currentUserContent.length > 0) {
    messages.push({ role: 'user', content: currentUserContent });
  }

  const jsonSchema = {
    name: 'product_data',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        price: { type: 'number' },
        cost_price: { type: 'number' },
        pauta_price: { type: 'number' },
        sku: { type: 'string' },
        product_type: { type: 'string', enum: ['product', 'service'] },
        variants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              size: { type: 'string' },
              color: { type: 'string' },
              stock: { type: 'number' }
            },
            required: ['size', 'color', 'stock'],
            additionalProperties: false
          }
        },
        benefits: {
          type: 'array',
          items: { type: 'string' }
        },
        components: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              desc: { type: 'string' }
            },
            required: ['name', 'desc'],
            additionalProperties: false
          }
        },
        assistantMessage: { type: 'string' }
      },
      required: [
        'title',
        'description',
        'category',
        'price',
        'cost_price',
        'pauta_price',
        'sku',
        'product_type',
        'variants',
        'benefits',
        'components',
        'assistantMessage'
      ],
      additionalProperties: false
    }
  };

  const body = {
    model: modelName || 'google/gemini-2.5-flash',
    messages,
    response_format: {
      type: 'json_schema',
      json_schema: jsonSchema
    },
    temperature: 0.2
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://andopages.com',
      'X-Title': 'andoPages'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API Error: ${response.status} - ${errText}`);
  }

  const result = await response.json();
  const textResponse = result.choices?.[0]?.message?.content;
  if (!textResponse) throw new Error('No se recibió respuesta del modelo OpenRouter.');

  return JSON.parse(textResponse);
}
