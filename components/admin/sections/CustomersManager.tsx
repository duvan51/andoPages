import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import SectionHeader from '../shared/SectionHeader';
import {
    Users,
    Search,
    Download,
    Copy,
    Check,
    MessageCircle,
    Mail,
    Phone,
    Award,
    Sparkles,
    Trash2,
    Edit3,
    Eye,
    Plus,
    RefreshCw,
    X,
    Calendar,
    MapPin,
    Coins,
    Shield,
    TrendingUp,
    Smartphone,
    Bell,
    BellRing,
    Send,
    Heart,
    ShoppingCart,
    MousePointerClick,
    ExternalLink,
    Tag,
    Clock,
    Flame,
    Package,
    ArrowRight
} from 'lucide-react';

interface CartItem {
    id: string;
    title: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    imageUrl?: string;
    category?: string;
}

interface CustomerActivity {
    id: string;
    customer_id: string;
    activity_type: string; // 'product_click', 'view_product', 'live_click', 'whatsapp_click', 'add_to_cart', 'favorite'
    title: string;
    category?: string;
    metadata?: any;
    created_at: string;
}

interface DeviceToken {
    id?: string;
    user_id?: string;
    expo_push_token: string;
    platform?: string;
    device_name?: string;
    app_version?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

interface Customer {
    id: string;
    company_id?: string;
    full_name: string;
    email: string;
    phone: string;
    points: number;
    tier: string;
    addresses?: any[] | null;
    preferences?: {
        favorite_categories?: string[];
        viewed_items?: string[];
        top_colors?: string[];
    } | null;
    tags?: string[];
    cart?: CartItem[] | null;
    cart_total?: number;
    cart_updated_at?: string;
    created_at?: string;
    updated_at?: string;
    // Vinculados
    device?: DeviceToken | null;
    activities?: CustomerActivity[];
}

interface CustomersManagerProps {
    companyId?: string;
}

const CustomersManager: React.FC<CustomersManagerProps> = ({ companyId }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTier, setSelectedTier] = useState<string>('all');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
    const [selectedDeviceFilter, setSelectedDeviceFilter] = useState<'all' | 'with_app' | 'web_only'>('all');
    const [selectedCartFilter, setSelectedCartFilter] = useState<'all' | 'with_cart' | 'no_cart'>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'cart_desc' | 'points_desc' | 'activity_desc' | 'name_asc'>('newest');

    // UI Feedback
    const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
    const [copiedToken, setCopiedToken] = useState<string | null>(null);
    const [copiedAllEmails, setCopiedAllEmails] = useState(false);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Modals
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [detailTab, setDetailTab] = useState<'cart' | 'interests' | 'device' | 'account'>('cart');
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
    const [isPushModalOpen, setIsPushModalOpen] = useState(false);

    // Points state
    const [pointsDelta, setPointsDelta] = useState<number>(10);
    const [pointsActionType, setPointsActionType] = useState<'add' | 'subtract'>('add');

    // Push notification modal state
    const [pushTitle, setPushTitle] = useState('¡Hola de JESKA Moda! 💖');
    const [pushMessage, setPushMessage] = useState('¡Tienes prendas esperándote en tu carrito! Completa tu pedido hoy con un beneficio especial.');
    const [isSendingPush, setIsSendingPush] = useState(false);

    // Form state for Create / Edit
    const [formData, setFormData] = useState({
        id: '',
        full_name: '',
        email: '',
        phone: '',
        points: 50,
        tier: 'Bronce',
        tags: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchCustomersData();
    }, [companyId]);

    const fetchCustomersData = async () => {
        setIsLoading(true);
        try {
            // 1. Obtener clientes de public.customers
            let custQuery = supabase.from('customers').select('*');
            if (companyId) {
                custQuery = custQuery.or(`company_id.eq.${companyId},company_id.is.null`);
            }
            const { data: customersData, error: custError } = await custQuery.order('created_at', { ascending: false });

            if (custError) {
                console.error('Error fetching customers:', custError);
                showNotification('Error al consultar clientes: ' + custError.message, 'error');
                setIsLoading(false);
                return;
            }

            // 2. Obtener dispositivos (app_push_tokens)
            let devicesMap: Record<string, DeviceToken> = {};
            try {
                let tokenQuery = supabase.from('app_push_tokens').select('*');
                if (companyId) {
                    tokenQuery = tokenQuery.or(`company_id.eq.${companyId},company_id.is.null`);
                }
                const { data: tokensData } = await tokenQuery;
                if (tokensData && tokensData.length > 0) {
                    tokensData.forEach((token: any) => {
                        if (token.user_id) devicesMap[token.user_id] = token;
                    });
                }
            } catch (err) {
                console.log('Tabla app_push_tokens no consultada:', err);
            }

            // 3. Obtener actividades y clics (customer_activities)
            let activitiesMap: Record<string, CustomerActivity[]> = {};
            try {
                let actQuery = supabase.from('customer_activities').select('*');
                if (companyId) {
                    actQuery = actQuery.or(`company_id.eq.${companyId},company_id.is.null`);
                }
                const { data: activitiesData } = await actQuery.order('created_at', { ascending: false });
                if (activitiesData && activitiesData.length > 0) {
                    activitiesData.forEach((act: any) => {
                        if (act.customer_id) {
                            if (!activitiesMap[act.customer_id]) activitiesMap[act.customer_id] = [];
                            activitiesMap[act.customer_id].push(act);
                        }
                    });
                }
            } catch (err) {
                console.log('Tabla customer_activities no consultada:', err);
            }

            // 4. Obtener carritos separados (si existen en public.customer_carts)
            let cartsMap: Record<string, { items: CartItem[]; total: number; updated_at?: string }> = {};
            try {
                let cartsQuery = supabase.from('customer_carts').select('*');
                if (companyId) {
                    cartsQuery = cartsQuery.or(`company_id.eq.${companyId},company_id.is.null`);
                }
                const { data: cartsData } = await cartsQuery;
                if (cartsData && cartsData.length > 0) {
                    cartsData.forEach((cartRow: any) => {
                        if (cartRow.customer_id) {
                            cartsMap[cartRow.customer_id] = {
                                items: Array.isArray(cartRow.items) ? cartRow.items : [],
                                total: Number(cartRow.total_amount) || 0,
                                updated_at: cartRow.updated_at
                            };
                        }
                    });
                }
            } catch (err) {
                console.log('Tabla customer_carts no consultada:', err);
            }

            // 5. Combinar todo
            const combinedCustomers: Customer[] = (customersData || []).map((c: any) => {
                const separateCart = cartsMap[c.id];
                const finalCart: CartItem[] = separateCart?.items?.length ? separateCart.items : Array.isArray(c.cart) ? c.cart : [];
                const finalCartTotal = separateCart?.total || Number(c.cart_total) || finalCart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

                return {
                    ...c,
                    cart: finalCart,
                    cart_total: finalCartTotal,
                    cart_updated_at: separateCart?.updated_at || c.cart_updated_at,
                    device: devicesMap[c.id] || null,
                    activities: activitiesMap[c.id] || []
                };
            });

            setCustomers(combinedCustomers);
        } catch (err: any) {
            console.error('Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
        setActionMessage({ text, type });
        setTimeout(() => setActionMessage(null), 4500);
    };

    // Helper: Extraer categoría top de un cliente
    const getTopCategory = (customer: Customer) => {
        if (customer.preferences?.favorite_categories && customer.preferences.favorite_categories.length > 0) {
            return customer.preferences.favorite_categories[0];
        }
        if (customer.activities && customer.activities.length > 0) {
            const counts: Record<string, number> = {};
            customer.activities.forEach((a) => {
                if (a.category) {
                    counts[a.category] = (counts[a.category] || 0) + 1;
                }
            });
            const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
            if (sorted.length > 0) return sorted[0][0];
        }
        if (customer.cart && customer.cart.length > 0 && customer.cart[0].category) {
            return customer.cart[0].category;
        }
        return null;
    };

    // Helper: Categorías únicas disponibles para el filtro
    const availableCategories = useMemo(() => {
        const catSet = new Set<string>();
        customers.forEach((c) => {
            if (c.preferences?.favorite_categories) {
                c.preferences.favorite_categories.forEach((cat) => catSet.add(cat));
            }
            if (c.activities) {
                c.activities.forEach((a) => {
                    if (a.category) catSet.add(a.category);
                });
            }
            if (c.cart) {
                c.cart.forEach((item) => {
                    if (item.category) catSet.add(item.category);
                });
            }
        });
        return Array.from(catSet);
    }, [customers]);

    // Filter & Sort Customers
    const filteredCustomers = useMemo(() => {
        return customers
            .filter((c) => {
                const search = searchTerm.toLowerCase();
                const matchesSearch =
                    (c.full_name || '').toLowerCase().includes(search) ||
                    (c.email || '').toLowerCase().includes(search) ||
                    (c.phone || '').toLowerCase().includes(search) ||
                    (c.tags || []).some((t) => t.toLowerCase().includes(search)) ||
                    (c.device?.device_name || '').toLowerCase().includes(search);

                const matchesTier =
                    selectedTier === 'all' ||
                    (c.tier || 'Bronce').toLowerCase() === selectedTier.toLowerCase();

                const matchesDevice =
                    selectedDeviceFilter === 'all' ||
                    (selectedDeviceFilter === 'with_app' && Boolean(c.device?.expo_push_token)) ||
                    (selectedDeviceFilter === 'web_only' && !c.device?.expo_push_token);

                const hasCart = Boolean(c.cart && c.cart.length > 0);
                const matchesCart =
                    selectedCartFilter === 'all' ||
                    (selectedCartFilter === 'with_cart' && hasCart) ||
                    (selectedCartFilter === 'no_cart' && !hasCart);

                const topCat = getTopCategory(c);
                const matchesCategory =
                    selectedCategoryFilter === 'all' ||
                    (topCat && topCat.toLowerCase() === selectedCategoryFilter.toLowerCase());

                return matchesSearch && matchesTier && matchesDevice && matchesCart && matchesCategory;
            })
            .sort((a, b) => {
                if (sortBy === 'newest') {
                    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
                }
                if (sortBy === 'oldest') {
                    return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
                }
                if (sortBy === 'cart_desc') {
                    return (b.cart_total || 0) - (a.cart_total || 0);
                }
                if (sortBy === 'points_desc') {
                    return (b.points || 0) - (a.points || 0);
                }
                if (sortBy === 'activity_desc') {
                    return (b.activities?.length || 0) - (a.activities?.length || 0);
                }
                if (sortBy === 'name_asc') {
                    return (a.full_name || '').localeCompare(b.full_name || '');
                }
                return 0;
            });
    }, [customers, searchTerm, selectedTier, selectedDeviceFilter, selectedCartFilter, selectedCategoryFilter, sortBy]);

    // KPI Metrics
    const metrics = useMemo(() => {
        const total = customers.length;
        const totalPoints = customers.reduce((acc, curr) => acc + (curr.points || 0), 0);
        const withApp = customers.filter((c) => Boolean(c.device?.expo_push_token)).length;
        const withActiveCart = customers.filter((c) => Boolean(c.cart && c.cart.length > 0));
        const totalCartValue = withActiveCart.reduce((acc, curr) => acc + (curr.cart_total || 0), 0);

        return { total, totalPoints, withApp, activeCartsCount: withActiveCart.length, totalCartValue };
    }, [customers]);

    // Copy single email
    const handleCopyEmail = (email: string) => {
        navigator.clipboard.writeText(email);
        setCopiedEmail(email);
        setTimeout(() => setCopiedEmail(null), 2000);
    };

    // Copy Expo Push Token
    const handleCopyToken = (token: string) => {
        navigator.clipboard.writeText(token);
        setCopiedToken(token);
        showNotification('¡Token de notificación push copiado!');
        setTimeout(() => setCopiedToken(null), 2000);
    };

    // Copy all customer emails
    const handleCopyAllEmails = () => {
        const allEmails = filteredCustomers
            .map((c) => c.email)
            .filter(Boolean)
            .join(', ');

        if (!allEmails) {
            showNotification('No hay correos disponibles para copiar.', 'error');
            return;
        }

        navigator.clipboard.writeText(allEmails);
        setCopiedAllEmails(true);
        showNotification(`¡${filteredCustomers.length} correos copiados al portapapeles!`);
        setTimeout(() => setCopiedAllEmails(false), 3000);
    };

    // Export to CSV with Cart Data
    const handleExportCSV = () => {
        if (filteredCustomers.length === 0) {
            showNotification('No hay datos para exportar.', 'error');
            return;
        }

        const headers = ['Nombre', 'Correo', 'Telefono', 'Puntos', 'Nivel', 'Prendas en Carrito', 'Valor Carrito', 'Gustos Top', 'Tiene App', 'Dispositivo', 'Fecha Registro'];
        const rows = filteredCustomers.map((c) => [
            `"${(c.full_name || '').replace(/"/g, '""')}"`,
            `"${(c.email || '').replace(/"/g, '""')}"`,
            `"${(c.phone || '').replace(/"/g, '""')}"`,
            c.points || 0,
            `"${c.tier || 'Bronce'}"`,
            c.cart?.length || 0,
            c.cart_total || 0,
            `"${(getTopCategory(c) || 'General').replace(/"/g, '""')}"`,
            c.device?.expo_push_token ? 'SI' : 'NO',
            `"${(c.device?.device_name || 'Web').replace(/"/g, '""')}"`,
            `"${c.created_at ? new Date(c.created_at).toLocaleDateString('es-CO') : ''}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `clientes_carritos_jeska_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('¡Archivo CSV descargado con éxito!');
    };

    // Open Edit / Create Modal
    const handleOpenEditModal = (customer?: Customer) => {
        if (customer) {
            setFormData({
                id: customer.id,
                full_name: customer.full_name || '',
                email: customer.email || '',
                phone: customer.phone || '',
                points: customer.points ?? 50,
                tier: customer.tier || 'Bronce',
                tags: (customer.tags || []).join(', ')
            });
        } else {
            setFormData({
                id: '',
                full_name: '',
                email: '',
                phone: '',
                points: 50,
                tier: 'Bronce',
                tags: ''
            });
        }
        setIsEditModalOpen(true);
    };

    // Save or Update Customer
    const handleSaveCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const parsedTags = formData.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);

            const customerPayload: any = {
                full_name: formData.full_name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                points: Number(formData.points) || 0,
                tier: formData.tier,
                tags: parsedTags,
                company_id: companyId || '733b1f9a-878d-4adc-9a77-1228a3c09df7',
                updated_at: new Date().toISOString()
            };

            if (formData.id) {
                const { error } = await supabase
                    .from('customers')
                    .update(customerPayload)
                    .eq('id', formData.id);

                if (error) throw error;
                showNotification('Cliente actualizado con éxito.');
            } else {
                const newId = crypto.randomUUID ? crypto.randomUUID() : 'cust_' + Date.now();
                customerPayload.id = newId;
                customerPayload.created_at = new Date().toISOString();

                const { error } = await supabase
                    .from('customers')
                    .insert([customerPayload]);

                if (error) throw error;
                showNotification('Nuevo cliente registrado.');
            }

            setIsEditModalOpen(false);
            fetchCustomersData();
        } catch (err: any) {
            showNotification('Error al guardar cliente: ' + (err.message || 'Error'), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Quick Points Adjust
    const handleQuickPointsUpdate = async () => {
        if (!selectedCustomer) return;
        setIsSaving(true);
        try {
            const change = pointsActionType === 'add' ? Number(pointsDelta) : -Number(pointsDelta);
            const newPoints = Math.max(0, (selectedCustomer.points || 0) + change);

            const { error } = await supabase
                .from('customers')
                .update({ points: newPoints, updated_at: new Date().toISOString() })
                .eq('id', selectedCustomer.id);

            if (error) throw error;

            showNotification(`Puntos actualizados a ${newPoints} pts.`);
            setIsPointsModalOpen(false);
            fetchCustomersData();
        } catch (err: any) {
            showNotification('Error actualizando puntos: ' + err.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Send Direct Push Notification
    const handleSendPushToCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer?.device?.expo_push_token) {
            showNotification('Este cliente no tiene la App instalada o no tiene un token push activo.', 'error');
            return;
        }

        setIsSendingPush(true);
        try {
            const pushToken = selectedCustomer.device.expo_push_token;
            const response = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: pushToken,
                    sound: 'default',
                    title: pushTitle.trim(),
                    body: pushMessage.trim(),
                    data: {
                        type: 'customer_direct_message',
                        customerId: selectedCustomer.id,
                        url: 'jeska://cart'
                    },
                }),
            });

            const result = await response.json();
            if (response.ok) {
                showNotification(`¡Notificación enviada con éxito a ${selectedCustomer.full_name}! 🔔`);
                setIsPushModalOpen(false);
            } else {
                throw new Error(result?.errors?.[0]?.message || 'Error en Expo Push API');
            }
        } catch (err: any) {
            showNotification('Error enviando notificación: ' + err.message, 'error');
        } finally {
            setIsSendingPush(false);
        }
    };

    // Delete Customer
    const handleDeleteCustomer = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar a ${name}? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('customers')
                .delete()
                .eq('id', id);

            if (error) throw error;
            showNotification(`Cliente ${name} eliminado.`);
            setCustomers((prev) => prev.filter((c) => c.id !== id));
        } catch (err: any) {
            showNotification('Error eliminando cliente: ' + err.message, 'error');
        }
    };

    // WhatsApp Cart Recovery Message generator
    const getCartRecoveryWhatsAppUrl = (customer: Customer) => {
        const cleanPhone = customer.phone.replace(/[^\d]/g, '');
        const formattedPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;
        
        let message = `¡Hola ${customer.full_name || 'hermosa'}! Te saludamos de JESKA Moda. 👗✨\n\n`;

        if (customer.cart && customer.cart.length > 0) {
            message += `Vimos que dejaste ${customer.cart.length} prenda(s) en tu carrito de compras:\n`;
            customer.cart.forEach((item, i) => {
                message += `• ${item.title}${item.selectedSize ? ` (Talla: ${item.selectedSize})` : ''} - $${Number(item.price).toLocaleString()} COP\n`;
            });
            message += `\n*Total a pagar: $${(customer.cart_total || 0).toLocaleString()} COP*\n\n`;
            message += `Tienes ${customer.points || 50} Puntos VIP que puedes redimir de inmediato. ¿Deseas que preparemos tu envío hoy mismo? 💕`;
        } else {
            message += `Tienes ${customer.points || 50} Puntos VIP disponibles para canjear en tus compras. ¿En qué prenda te gustaría asesoría hoy?`;
        }

        return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    };

    // Tier badge styles
    const getTierBadge = (tier: string = 'Bronce') => {
        const t = tier.toLowerCase();
        if (t === 'diamante') {
            return { label: 'Diamante 💎', className: 'bg-cyan-100 text-cyan-900 border-cyan-300 font-black' };
        }
        if (t === 'oro') {
            return { label: 'Oro 🥇', className: 'bg-amber-100 text-amber-900 border-amber-300 font-bold' };
        }
        if (t === 'plata') {
            return { label: 'Plata 🥈', className: 'bg-slate-200 text-slate-800 border-slate-300' };
        }
        if (t === 'vip') {
            return { label: 'VIP 👑', className: 'bg-purple-100 text-purple-800 border-purple-300 font-black' };
        }
        return { label: 'Bronce 🥉', className: 'bg-orange-50 text-orange-800 border-orange-200' };
    };

    // Activity icon helper
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'live_click':
                return <Flame size={14} className="text-red-500" />;
            case 'add_to_cart':
                return <ShoppingCart size={14} className="text-amber-500" />;
            case 'favorite':
                return <Heart size={14} className="text-pink-500" />;
            case 'whatsapp_click':
                return <MessageCircle size={14} className="text-emerald-500" />;
            default:
                return <MousePointerClick size={14} className="text-blue-500" />;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <SectionHeader
                title="Clientes, Carritos Guardados y Gustos"
                subtitle="Monitorea el perfil de tus clientas, lo que tienen en su carrito de compras y sus clics en tiempo real."
                rightElement={
                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            type="button"
                            onClick={handleCopyAllEmails}
                            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-all active:scale-95"
                            title="Copiar todos los correos para campañas masivas"
                        >
                            {copiedAllEmails ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                            <span>{copiedAllEmails ? '¡Copiados!' : 'Copiar Correos'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-all active:scale-95"
                        >
                            <Download size={16} />
                            <span>Exportar CSV</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleOpenEditModal()}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                        >
                            <Plus size={16} />
                            <span>Nuevo Cliente</span>
                        </button>
                    </div>
                }
            />

            {/* Notification Alert */}
            {actionMessage && (
                <div
                    className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in ${
                        actionMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                >
                    <span>{actionMessage.text}</span>
                    <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">
                        ✕
                    </button>
                </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Clientes</p>
                        <h3 className="text-2xl font-black text-slate-900">{metrics.total}</h3>
                    </div>
                </div>

                {/* KPI: Carritos por Recuperar */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md shadow-amber-500/20">
                        <ShoppingCart size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-amber-800 uppercase tracking-wider">Carritos Guardados</p>
                        <h3 className="text-xl font-black text-amber-950">
                            {metrics.activeCartsCount} <span className="text-xs font-bold text-amber-700 font-sans">(${metrics.totalCartValue.toLocaleString()})</span>
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0">
                        <Smartphone size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Con App Móvil</p>
                        <h3 className="text-2xl font-black text-slate-900">{metrics.withApp}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl shrink-0">
                        <Coins size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Puntos VIP Acumulados</p>
                        <h3 className="text-2xl font-black text-slate-900">{metrics.totalPoints.toLocaleString()} pts</h3>
                    </div>
                </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Search */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, correo, celular o prenda..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-medium text-slate-800"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                    {/* Filtro Carrito */}
                    <select
                        value={selectedCartFilter}
                        onChange={(e) => setSelectedCartFilter(e.target.value as any)}
                        className={`px-3 py-2 text-xs border rounded-xl font-black outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                            selectedCartFilter === 'with_cart'
                                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                    >
                        <option value="all">🛒 Todos los carritos</option>
                        <option value="with_cart">🔥 Con Carrito Activo</option>
                        <option value="no_cart">Sin Carrito</option>
                    </select>

                    {/* Canal */}
                    <select
                        value={selectedDeviceFilter}
                        onChange={(e) => setSelectedDeviceFilter(e.target.value as any)}
                        className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="all">📱 Todos los canales</option>
                        <option value="with_app">📲 Con App Móvil</option>
                        <option value="web_only">🌐 Solo Web</option>
                    </select>

                    {/* Categoría / Gusto */}
                    <select
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="all">🎯 Todos los Gustos</option>
                        {availableCategories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    {/* Nivel */}
                    <select
                        value={selectedTier}
                        onChange={(e) => setSelectedTier(e.target.value)}
                        className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="all">Todos los Niveles</option>
                        <option value="Diamante">💎 Diamante</option>
                        <option value="Oro">🥇 Oro</option>
                        <option value="Plata">🥈 Plata</option>
                        <option value="Bronce">🥉 Bronce</option>
                    </select>

                    {/* Ordenar */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="newest">Más recientes</option>
                        <option value="cart_desc">Mayor valor en Carrito 🛒</option>
                        <option value="activity_desc">Más activos (clics)</option>
                        <option value="points_desc">Mayor puntaje</option>
                        <option value="oldest">Más antiguos</option>
                        <option value="name_asc">Nombre A-Z</option>
                    </select>

                    <button
                        onClick={fetchCustomersData}
                        disabled={isLoading}
                        title="Refrescar lista"
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="py-20 text-center text-slate-400">
                        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-xs font-bold uppercase tracking-wider">Cargando clientas, carritos y gustos...</p>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 space-y-3">
                        <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                            <Users size={28} />
                        </div>
                        <h4 className="text-base font-bold text-slate-800">No se encontraron clientes</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            {searchTerm
                                ? 'No hay resultados para los filtros seleccionados.'
                                : 'Los clientes y carritos aparecerán automáticamente cuando interactúen en la App o en la Web.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="py-3.5 px-4">Cliente</th>
                                    <th className="py-3.5 px-4">Correo / Celular</th>
                                    <th className="py-3.5 px-4">Carrito Guardado</th>
                                    <th className="py-3.5 px-4">Gustos & Clics</th>
                                    <th className="py-3.5 px-4 text-center">App Móvil</th>
                                    <th className="py-3.5 px-4 text-center">Nivel</th>
                                    <th className="py-3.5 px-4 text-center">Puntos VIP</th>
                                    <th className="py-3.5 px-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                                {filteredCustomers.map((c) => {
                                    const tierBadge = getTierBadge(c.tier);
                                    const topCategory = getTopCategory(c);
                                    const clickCount = c.activities?.length || 0;
                                    const hasCart = Boolean(c.cart && c.cart.length > 0);
                                    const cartItemCount = c.cart?.length || 0;
                                    const cartTotal = c.cart_total || 0;

                                    const initials = (c.full_name || c.email || 'C')
                                        .split(' ')
                                        .map((n) => n[0])
                                        .slice(0, 2)
                                        .join('')
                                        .toUpperCase();

                                    const hasApp = Boolean(c.device?.expo_push_token);

                                    return (
                                        <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Name & Avatar */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                                                        {initials}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-900 truncate">{c.full_name || 'Sin Nombre'}</p>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            {c.tags && c.tags.slice(0, 2).map((tag, i) => (
                                                                <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Email & WhatsApp */}
                                            <td className="py-3.5 px-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="truncate font-semibold text-slate-800">{c.email}</span>
                                                        <button
                                                            onClick={() => handleCopyEmail(c.email)}
                                                            className="p-0.5 text-slate-400 hover:text-emerald-600 shrink-0"
                                                            title="Copiar correo"
                                                        >
                                                            {copiedEmail === c.email ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                                        </button>
                                                    </div>
                                                    {c.phone ? (
                                                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                                                            <span>{c.phone}</span>
                                                            <a
                                                                href={getCartRecoveryWhatsAppUrl(c)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-emerald-600 hover:text-emerald-700 font-bold"
                                                                title="Recuperar carrito por WhatsApp"
                                                            >
                                                                <MessageCircle size={13} className="inline mr-0.5" />
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-[10px]">Sin teléfono</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Carrito Guardado */}
                                            <td className="py-3.5 px-4">
                                                {hasCart ? (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCustomer(c);
                                                            setDetailTab('cart');
                                                            setIsViewModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors text-left"
                                                        title="Ver prendas en el carrito"
                                                    >
                                                        <ShoppingCart size={13} className="text-amber-600 shrink-0" />
                                                        <div>
                                                            <span className="font-black text-[11px] block">{cartItemCount} prenda{cartItemCount !== 1 ? 's' : ''}</span>
                                                            <span className="text-[10px] text-amber-700 font-bold font-mono">${cartTotal.toLocaleString()} COP</span>
                                                        </div>
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-400 text-[11px] italic">Vacío</span>
                                                )}
                                            </td>

                                            {/* Gustos & Clics */}
                                            <td className="py-3.5 px-4">
                                                <div className="space-y-1">
                                                    {topCategory ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-pink-50 text-pink-700 border border-pink-200">
                                                            <span>👗 {topCategory}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400 italic">General</span>
                                                    )}
                                                    <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                                        <MousePointerClick size={12} className="text-purple-500" />
                                                        <span>{clickCount} clic{clickCount !== 1 ? 's' : ''}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* App Móvil */}
                                            <td className="py-3.5 px-4 text-center">
                                                {hasApp ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                        <span>{c.device?.platform?.toUpperCase() || 'APP'}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 font-medium">Solo Web</span>
                                                )}
                                            </td>

                                            {/* Tier */}
                                            <td className="py-3.5 px-4 text-center">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${tierBadge.className}`}>
                                                    {tierBadge.label}
                                                </span>
                                            </td>

                                            {/* Puntos */}
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCustomer(c);
                                                        setIsPointsModalOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-black text-xs transition-colors"
                                                    title="Modificar puntos"
                                                >
                                                    <Coins size={12} />
                                                    <span>{c.points ?? 0}</span>
                                                </button>
                                            </td>

                                            {/* Acciones */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCustomer(c);
                                                            setDetailTab(hasCart ? 'cart' : 'interests');
                                                            setIsViewModalOpen(true);
                                                        }}
                                                        className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                                                        title="Ver detalles, carritos y gustos"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    {hasApp && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCustomer(c);
                                                                setIsPushModalOpen(true);
                                                            }}
                                                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                                            title="Enviar notificación push al celular"
                                                        >
                                                            <Bell size={16} />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleOpenEditModal(c)}
                                                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
                                                        title="Editar datos"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteCustomer(c.id, c.full_name || c.email)}
                                                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                                                        title="Eliminar cliente"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* MODAL 1: Perfil 360°, Carritos Guardados, Gustos y Clics                   */}
            {/* ========================================================================= */}
            {isViewModalOpen && selectedCustomer && (
                <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-scale-up flex flex-col max-h-[92vh]">
                        {/* Cabecera */}
                        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                                    {(selectedCustomer.full_name || selectedCustomer.email || 'C')[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-black">{selectedCustomer.full_name || 'Cliente'}</h3>
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20">
                                            {selectedCustomer.tier || 'Bronce'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/70">{selectedCustomer.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Tabs del Modal */}
                        <div className="flex border-b border-slate-100 px-6 bg-slate-50/50 overflow-x-auto">
                            <button
                                onClick={() => setDetailTab('cart')}
                                className={`py-3.5 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                                    detailTab === 'cart'
                                        ? 'border-amber-500 text-amber-700 bg-white'
                                        : 'border-transparent text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                <ShoppingCart size={15} />
                                <span>🛒 Carrito Guardado ({selectedCustomer.cart?.length || 0})</span>
                            </button>

                            <button
                                onClick={() => setDetailTab('interests')}
                                className={`py-3.5 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                                    detailTab === 'interests'
                                        ? 'border-purple-600 text-purple-700 bg-white'
                                        : 'border-transparent text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                <Heart size={15} />
                                <span>🎯 Gustos y Clics</span>
                            </button>

                            <button
                                onClick={() => setDetailTab('device')}
                                className={`py-3.5 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                                    detailTab === 'device'
                                        ? 'border-purple-600 text-purple-700 bg-white'
                                        : 'border-transparent text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                <Smartphone size={15} />
                                <span>📱 App & Notificaciones</span>
                            </button>

                            <button
                                onClick={() => setDetailTab('account')}
                                className={`py-3.5 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                                    detailTab === 'account'
                                        ? 'border-purple-600 text-purple-700 bg-white'
                                        : 'border-transparent text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                <Users size={15} />
                                <span>🔐 Cuenta & Puntos</span>
                            </button>
                        </div>

                        {/* Contenido scrolleable */}
                        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 text-xs">
                            {/* TAB 1: CARRITO GUARDADO */}
                            {detailTab === 'cart' && (
                                <div className="space-y-5">
                                    {selectedCustomer.cart && selectedCustomer.cart.length > 0 ? (
                                        <>
                                            {/* Resumen del Carrito */}
                                            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">
                                                        Total en Carrito
                                                    </span>
                                                    <h3 className="text-2xl font-black text-amber-950 font-mono">
                                                        ${(selectedCustomer.cart_total || 0).toLocaleString()} COP
                                                    </h3>
                                                    <p className="text-[11px] text-amber-800 mt-0.5">
                                                        {selectedCustomer.cart.length} prenda(s) pendientes por comprar
                                                    </p>
                                                </div>

                                                {selectedCustomer.phone && (
                                                    <a
                                                        href={getCartRecoveryWhatsAppUrl(selectedCustomer)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                                                    >
                                                        <MessageCircle size={16} />
                                                        <span>Recuperar por WhatsApp</span>
                                                    </a>
                                                )}
                                            </div>

                                            {/* Lista de Prendas en el Carrito */}
                                            <div className="space-y-2.5">
                                                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                                                    Prendas Guardadas en el Carrito:
                                                </h4>
                                                {selectedCustomer.cart.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-3.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between hover:border-amber-300 transition-colors shadow-xs"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                                                                {item.imageUrl ? (
                                                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Package size={20} className="text-slate-400" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h5 className="font-bold text-slate-900 text-xs">{item.title}</h5>
                                                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                                                    {item.selectedSize && (
                                                                        <span className="font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                                                            Talla: {item.selectedSize}
                                                                        </span>
                                                                    )}
                                                                    {item.selectedColor && (
                                                                        <span className="font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                                                            Color: {item.selectedColor}
                                                                        </span>
                                                                    )}
                                                                    <span>Cant: <b>{item.quantity || 1}</b></span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <span className="font-black text-slate-900 font-mono text-xs block">
                                                                ${(Number(item.price) * (Number(item.quantity) || 1)).toLocaleString()} COP
                                                            </span>
                                                            {item.quantity > 1 && (
                                                                <span className="text-[10px] text-slate-400 font-mono block">
                                                                    (${Number(item.price).toLocaleString()} c/u)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                                            <ShoppingCart size={32} className="mx-auto opacity-50 text-slate-400" />
                                            <p className="font-bold text-slate-700">El carrito de esta clienta está vacío</p>
                                            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                                                Cuando agregue prendas a su bolsa en la App o Web, las verás listadas aquí con sus tallas y precios.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 2: GUSTOS E INTERESES */}
                            {detailTab === 'interests' && (
                                <div className="space-y-5">
                                    {/* Categorías Favoritas */}
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-3">
                                            Categorías & Prendas de Mayor Interés:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCustomer.preferences?.favorite_categories && selectedCustomer.preferences.favorite_categories.length > 0 ? (
                                                selectedCustomer.preferences.favorite_categories.map((cat, i) => (
                                                    <span key={i} className="px-3 py-1 bg-white border border-slate-200 text-slate-800 rounded-xl font-bold text-xs shadow-xs">
                                                        👗 {cat}
                                                    </span>
                                                ))
                                            ) : getTopCategory(selectedCustomer) ? (
                                                <span className="px-3 py-1 bg-pink-100 border border-pink-200 text-pink-900 rounded-xl font-black text-xs">
                                                    ✨ {getTopCategory(selectedCustomer)} (Mayor afinidad)
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic">No ha registrado categorías favoritas aún.</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Historial de Clics e Interacciones */}
                                    <div>
                                        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-3">
                                            Historial de Clics y Navegación ({selectedCustomer.activities?.length || 0}):
                                        </h4>

                                        {selectedCustomer.activities && selectedCustomer.activities.length > 0 ? (
                                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                                                {selectedCustomer.activities.map((act) => (
                                                    <div key={act.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between hover:border-purple-300 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-slate-50 rounded-lg">
                                                                {getActivityIcon(act.activity_type)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900">{act.title}</p>
                                                                <p className="text-[10px] text-slate-400">
                                                                    {act.category ? `Categoría: ${act.category} • ` : ''}
                                                                    {new Date(act.created_at).toLocaleString('es-CO')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {act.metadata?.price && (
                                                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                                                ${Number(act.metadata.price).toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                                <MousePointerClick size={24} className="mx-auto mb-2 opacity-50" />
                                                <p className="font-bold">Aún no hay clics registrados para este cliente.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: DISPOSITIVO MÓVIL */}
                            {detailTab === 'device' && (
                                <div className="space-y-4">
                                    {selectedCustomer.device?.expo_push_token ? (
                                        <div className="p-5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Smartphone size={20} className="text-blue-600" />
                                                    <span className="font-black text-blue-950 text-sm">Dispositivo Móvil Conectado</span>
                                                </div>
                                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700 border border-emerald-300">
                                                    ● PUSH ACTIVO
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-slate-700">
                                                <div className="flex justify-between py-1 border-b border-blue-100">
                                                    <span className="font-bold text-slate-500">Modelo:</span>
                                                    <span className="font-bold text-slate-900">{selectedCustomer.device.device_name || 'Smartphone'}</span>
                                                </div>
                                                <div className="flex justify-between py-1 border-b border-blue-100">
                                                    <span className="font-bold text-slate-500">Plataforma:</span>
                                                    <span className="font-bold text-slate-900 uppercase">{selectedCustomer.device.platform || 'Móvil'}</span>
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-500 block mb-1">Expo Push Token:</span>
                                                    <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-blue-100">
                                                        <span className="font-mono text-[10px] truncate text-slate-600 flex-1">
                                                            {selectedCustomer.device.expo_push_token}
                                                        </span>
                                                        <button
                                                            onClick={() => handleCopyToken(selectedCustomer.device!.expo_push_token)}
                                                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[10px]"
                                                        >
                                                            {copiedToken ? '¡Copiado!' : 'Copiar'}
                                                        </button>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsViewModalOpen(false);
                                                        setIsPushModalOpen(true);
                                                    }}
                                                    className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                                                >
                                                    <BellRing size={15} />
                                                    <span>Enviar Notificación Push Directa</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                                            <Smartphone size={32} className="mx-auto mb-2 opacity-50" />
                                            <p className="font-bold text-slate-700">Sin App Móvil Instalada</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 4: CUENTA Y PUNTOS */}
                            {detailTab === 'account' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">Puntos VIP</span>
                                            <span className="text-2xl font-black text-amber-900">{selectedCustomer.points ?? 0} pts</span>
                                        </div>
                                        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block">Nivel / Membresía</span>
                                            <span className="text-2xl font-black text-purple-900">{selectedCustomer.tier || 'Bronce'}</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                                        <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Detalles de Supabase Auth</h4>
                                        <div className="space-y-1.5 text-slate-600">
                                            <div className="flex justify-between">
                                                <span className="font-bold">User UUID:</span>
                                                <span className="font-mono text-[10px] text-slate-800">{selectedCustomer.id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-bold">Correo:</span>
                                                <span className="font-semibold text-slate-800">{selectedCustomer.email}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-bold">Celular:</span>
                                                <span className="font-mono text-slate-800">{selectedCustomer.phone || 'No registrado'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-bold">Fecha de Registro:</span>
                                                <span className="text-slate-800">
                                                    {selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleString('es-CO') : '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Direcciones Guardadas:</h4>
                                        {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                                            <div className="space-y-2">
                                                {selectedCustomer.addresses.map((addr, i) => (
                                                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                                        <p className="font-bold text-slate-800">{addr.street || addr.address || JSON.stringify(addr)}</p>
                                                        {addr.city && <p className="text-slate-500 text-[11px]">{addr.city}, {addr.department || ''}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-slate-400 italic">No tiene direcciones guardadas aún.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2.5">
                            {selectedCustomer.phone && (
                                <a
                                    href={getCartRecoveryWhatsAppUrl(selectedCustomer)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-xs flex items-center justify-center gap-2 transition-colors"
                                >
                                    <MessageCircle size={16} />
                                    <span>WhatsApp Directo</span>
                                </a>
                            )}
                            <a
                                href={`mailto:${selectedCustomer.email}`}
                                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-center text-xs flex items-center justify-center gap-2 transition-colors"
                            >
                                <Mail size={16} />
                                <span>Enviar Email</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 2: Crear / Editar Cliente                                           */}
            {/* ========================================================================= */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-scale-up">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-base font-black text-slate-900">
                                {formData.id ? 'Editar Datos del Cliente' : 'Registrar Nuevo Cliente'}
                            </h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Laura Gómez"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition text-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico *</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="cliente@ejemplo.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition text-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / WhatsApp</label>
                                <input
                                    type="tel"
                                    placeholder="Ej: +57 300 123 4567"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition text-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Etiquetas (separadas por coma)</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Amante de Vestidos, Carrito Abandonado, VIP"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition text-slate-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Puntos Iniciales</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.points}
                                        onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Nivel / Tier</label>
                                    <select
                                        value={formData.tier}
                                        onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-slate-700"
                                    >
                                        <option value="Bronce">🥉 Bronce</option>
                                        <option value="Plata">🥈 Plata</option>
                                        <option value="Oro">🥇 Oro</option>
                                        <option value="Diamante">💎 Diamante</option>
                                        <option value="VIP">👑 VIP</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSaving ? 'Guardando...' : 'Guardar Cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 3: Ajustar Puntos Rápidamente                                       */}
            {/* ========================================================================= */}
            {isPointsModalOpen && selectedCustomer && (
                <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 animate-scale-up">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black text-slate-900">Ajustar Puntos</h3>
                                <p className="text-[11px] text-slate-500">{selectedCustomer.full_name}</p>
                            </div>
                            <button
                                onClick={() => setIsPointsModalOpen(false)}
                                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-500"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="text-center p-3 bg-amber-50 rounded-2xl border border-amber-100">
                                <span className="text-xs text-amber-700 font-bold">Balance Actual:</span>
                                <p className="text-2xl font-black text-amber-900">{selectedCustomer.points ?? 0} pts</p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPointsActionType('add')}
                                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                                        pointsActionType === 'add'
                                            ? 'bg-emerald-600 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600'
                                    }`}
                                >
                                    + Sumar Puntos
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPointsActionType('subtract')}
                                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                                        pointsActionType === 'subtract'
                                            ? 'bg-red-600 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600'
                                    }`}
                                >
                                    - Restar Puntos
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Cantidad de puntos:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={pointsDelta}
                                    onChange={(e) => setPointsDelta(Math.max(1, Number(e.target.value)))}
                                    className="w-full px-3.5 py-2.5 text-base font-black text-center bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>

                            <div className="pt-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsPointsModalOpen(false)}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleQuickPointsUpdate}
                                    disabled={isSaving}
                                    className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white font-black rounded-xl text-xs transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? 'Guardando...' : 'Aplicar Cambio'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 4: Enviar Notificación Push Directa al Móvil                         */}
            {/* ========================================================================= */}
            {isPushModalOpen && selectedCustomer && (
                <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-scale-up">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                                    <BellRing size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black">Enviar Notificación Push</h3>
                                    <p className="text-[11px] text-white/80">A: {selectedCustomer.full_name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsPushModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSendPushToCustomer} className="p-6 space-y-4">
                            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-[11px] text-blue-950 flex items-center gap-2">
                                <Smartphone size={18} className="shrink-0 text-blue-600" />
                                <span>
                                    Dispositivo: <b>{selectedCustomer.device?.device_name || 'Móvil'}</b> (
                                    {selectedCustomer.device?.platform?.toUpperCase() || 'APP'})
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Título de la Notificación *</label>
                                <input
                                    type="text"
                                    required
                                    value={pushTitle}
                                    onChange={(e) => setPushTitle(e.target.value)}
                                    placeholder="Ej: ¡Tus prendas en el carrito te esperan! 🎁"
                                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-slate-900 font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Mensaje de la Notificación *</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={pushMessage}
                                    onChange={(e) => setPushMessage(e.target.value)}
                                    placeholder="Escribe el mensaje que verá la clienta en la pantalla de su celular..."
                                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-slate-900 font-medium"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsPushModalOpen(false)}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSendingPush}
                                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSendingPush ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Enviando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={14} />
                                            <span>Enviar Push Ahora</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomersManager;
