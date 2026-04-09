export const formatPriceCOP = (price: string | number | undefined | null) => {
    if (price === undefined || price === null || price === '') return '';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return price.toString();
    
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
    }).format(num);
};
