import { formatCurrency, formatDate, getTagIcon, getTagColor, getCategoryIcon } from '../../lib/utils.js';
import './ExpenseList.css';

export default function ExpenseList({ expenses, showPaidBy = false, onEdit, onDelete, onValidate }) {
    if (!expenses || expenses.length === 0) {
        return (
            <div className="expense-list__empty">
                <span className="expense-list__empty-icon">📭</span>
                <p>Aucune dépense pour cette période</p>
            </div>
        );
    }

    const pendingCount = expenses.filter((expense) => expense.category === 'EN_ATTENTE_VALIDATION').length;

    return (
        <div className="expense-list">
            {pendingCount > 0 && (
                <div className="expense-list__pending-banner">
                    <strong>{pendingCount}</strong> dépense{pendingCount > 1 ? 's' : ''} à vérifier
                </div>
            )}
            {expenses.map((expense, i) => (
                <div
                    className={`expense-item ${expense.category === 'EN_ATTENTE_VALIDATION' ? 'expense-item--pending' : ''}`}
                    key={i}
                >
                    <div className="expense-item__left">
                        <span
                            className="expense-item__icon"
                            style={{ background: `${getTagColor(expense.tag)}20`, color: getTagColor(expense.tag) }}
                        >
                            {getTagIcon(expense.tag)}
                        </span>
                        <div className="expense-item__info">
                            <span className="expense-item__title">{expense.title}</span>
                            <span className="expense-item__meta">
                                {expense.tag && (
                                    <span
                                        className="expense-item__tag"
                                        style={{ color: getTagColor(expense.tag) }}
                                    >
                                        {expense.tag}
                                    </span>
                                )}
                                {(expense.category === 'PERSO' || expense.category === 'COMMUN') && (
                                    <span
                                        className={`expense-item__category expense-item__category--${expense.category.toLowerCase()}`}
                                    >
                                        {getCategoryIcon(expense.category)} {expense.category.toLowerCase()}
                                    </span>
                                )}
                                {expense.category === 'EN_ATTENTE_VALIDATION' && (
                                    <span className="expense-item__status">⚠️ à vérifier</span>
                                )}
                                {showPaidBy && expense.paid_by && (
                                    <span className="expense-item__paid-by">par {expense.paid_by}</span>
                                )}
                                {expense.date && <span className="expense-item__date">{formatDate(expense.date)}</span>}
                            </span>
                        </div>
                    </div>
                    <div className="expense-item__right">
                        <div className={`expense-item__amount ${Number(expense.amount) < 0 ? 'negative' : 'positive'}`}>
                            {formatCurrency(expense.amount)}
                        </div>
                        {(onEdit || onDelete || onValidate) && (
                            <div className="expense-item__actions">
                                {expense.category === 'EN_ATTENTE_VALIDATION' && onValidate && (
                                    <button
                                        className="expense-item__action-btn expense-item__action-btn--success"
                                        type="button"
                                        onClick={() => onValidate(expense.id)}
                                    >
                                        Valider
                                    </button>
                                )}
                                <button
                                    className="expense-item__action-btn"
                                    type="button"
                                    onClick={() => onEdit(expense)}
                                >
                                    Modifier
                                </button>
                                {onDelete && (
                                    <button
                                        className="expense-item__action-btn expense-item__action-btn--danger"
                                        type="button"
                                        onClick={() => onDelete(expense.id)}
                                    >
                                        Supprimer
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
