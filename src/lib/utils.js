export const MONTHS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const TAG_LIST = [
    'courses', 'shopping', 'sport', 'abonnement', 'virement',
    'revenu', 'prélèvement', 'bien-être', 'remboursement',
    'carte', 'restaurant', 'transport', 'logement', 'santé', 'autre'
];

const TAG_CONFIG = {
    courses:       { icon: '🛒', color: '#22c55e' },
    shopping:      { icon: '🛍️', color: '#f59e0b' },
    sport:         { icon: '🏋️', color: '#3b82f6' },
    abonnement:    { icon: '🔄', color: '#8b5cf6' },
    virement:      { icon: '💸', color: '#06b6d4' },
    revenu:        { icon: '💰', color: '#10b981' },
    'prélèvement': { icon: '🏦', color: '#ef4444' },
    'bien-être':   { icon: '💆', color: '#ec4899' },
    remboursement: { icon: '↩️', color: '#14b8a6' },
    carte:         { icon: '💳', color: '#f97316' },
    restaurant:    { icon: '🍽️', color: '#e11d48' },
    transport:     { icon: '🚗', color: '#64748b' },
    logement:      { icon: '🏠', color: '#a855f7' },
    'santé':       { icon: '⚕️', color: '#0ea5e9' },
    autre:         { icon: '📦', color: '#6b7280' },
};

export function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(amount);
}

export function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
    });
}

export function getTagColor(tag) {
    return TAG_CONFIG[tag]?.color || TAG_CONFIG.autre.color;
}

export function getTagIcon(tag) {
    return TAG_CONFIG[tag]?.icon || TAG_CONFIG.autre.icon;
}

export function getCategoryColor(category) {
    const colors = {
        PERSO: 'var(--color-accent)',
        COMMUN: 'var(--color-warning)',
    };
    return colors[category] || 'var(--color-text-muted)';
}

export function getCategoryIcon(category) {
    const icons = {
        PERSO: '👤',
        COMMUN: '👥',
    };
    return icons[category] || '📦';
}
