import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import './StatCard.css';

export default function StatCard({ label, value, icon, trend, accent = 'default' }) {
    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend > 0) return <TrendingUp size={14} />;
        if (trend < 0) return <TrendingDown size={14} />;
        return <Minus size={14} />;
    };

    return (
        <div className={`stat-card stat-card--${accent}`}>
            <div className="stat-card__header">
                <span className="stat-card__icon">{icon}</span>
                <span className="stat-card__label">{label}</span>
            </div>
            <div className="stat-card__value">{value}</div>
            {trend !== undefined && (
                <div className={`stat-card__trend ${trend >= 0 ? 'positive' : 'negative'}`}>
                    {getTrendIcon()}
                    <span>{Math.abs(trend).toFixed(1)}%</span>
                </div>
            )}
        </div>
    );
}
