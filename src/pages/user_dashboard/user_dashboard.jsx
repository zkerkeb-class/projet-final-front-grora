import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wallet, TrendingDown, Receipt, ArrowDownUp, ChevronLeft, ChevronRight } from 'lucide-react';

import Layout from '../../components/Layout/Layout.jsx';
import StatCard from '../../components/StatCard/StatCard.jsx';
import MonthPicker from '../../components/MonthPicker/MonthPicker.jsx';
import ExpenseList from '../../components/ExpenseList/ExpenseList.jsx';
import { api } from '../../lib/api.js';
import { formatCurrency, formatDate, getTagColor, TAG_LIST } from '../../lib/utils.js';
import './user_dashboard.css';

function Dashboard({ view = 'PERSO' }) {
  const navigate = useNavigate();
  const isFoyerView = view === 'FOYER';
  const apiCategory = isFoyerView ? 'COMMUN' : 'PERSO';

  const [privateData, setPrivateData] = useState(null);
  const [householdData, setHouseholdData] = useState(null);
  const [excludedKeywords, setExcludedKeywords] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [householdSuccess, setHouseholdSuccess] = useState('');
  const [householdEmail, setHouseholdEmail] = useState('');
  const [householdSubmitting, setHouseholdSubmitting] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordSubmitting, setKeywordSubmitting] = useState(false);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [chartView, setChartView] = useState('expenses'); // 'expenses' | 'income'
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    amount: '',
    date: '',
    details: '',
    tag: 'autre',
    category: 'PERSO',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    try {
      jwtDecode(token);
      fetchData(month, year);
    } catch {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [month, year, apiCategory]);

  const fetchData = async (m, y) => {
    setIsLoading(true);
    try {
      const requests = [
        api.getDashboard({ month: m, year: y, category: apiCategory }),
        api.getStats({ month: m, year: y, category: apiCategory }),
      ];

      if (isFoyerView) {
        requests.push(api.getMyHousehold());
      } else {
        requests.push(api.listExcludedKeywords());
      }

      const [dashboardData, statsData, thirdPayload] = await Promise.all(requests);
      setPrivateData(dashboardData);
      setStats(statsData);
      if (isFoyerView) {
        setHouseholdData(thirdPayload || null);
      } else {
        setExcludedKeywords(thirdPayload?.keywords || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateHousehold = async () => {
    setHouseholdSubmitting(true);
    setError(null);
    setHouseholdSuccess('');
    try {
      await api.createMyHousehold();
      await fetchData(month, year);
      setHouseholdSuccess('Foyer créé. Vous êtes maintenant admin du foyer.');
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du foyer');
    } finally {
      setHouseholdSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!householdEmail.trim()) return;

    setHouseholdSubmitting(true);
    setError(null);
    setHouseholdSuccess('');
    try {
      await api.addHouseholdMemberByEmail(householdEmail.trim());
      setHouseholdEmail('');
      await fetchData(month, year);
      setHouseholdSuccess('Membre ajouté avec succès.');
    } catch (err) {
      setError(err.message || 'Impossible d\'ajouter ce membre');
    } finally {
      setHouseholdSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    const confirmed = window.confirm('Retirer ce membre du foyer ?');
    if (!confirmed) return;

    setHouseholdSubmitting(true);
    setError(null);
    setHouseholdSuccess('');
    try {
      await api.removeHouseholdMember(userId);
      await fetchData(month, year);
      setHouseholdSuccess('Membre retiré du foyer.');
    } catch (err) {
      setError(err.message || 'Impossible de retirer ce membre');
    } finally {
      setHouseholdSubmitting(false);
    }
  };

  const handleLeaveHousehold = async () => {
    const confirmed = window.confirm('Quitter le foyer ?');
    if (!confirmed) return;

    setHouseholdSubmitting(true);
    setError(null);
    setHouseholdSuccess('');
    try {
      const result = await api.leaveMyHousehold();
      await fetchData(month, year);

      if (result?.householdDeleted) {
        setHouseholdSuccess('Vous avez quitté le foyer. Le foyer a été supprimé car vous étiez seul.');
      } else if (result?.adminTransferred) {
        setHouseholdSuccess('Vous avez quitté le foyer. Un autre membre est maintenant admin.');
      } else {
        setHouseholdSuccess('Vous avez quitté le foyer.');
      }
    } catch (err) {
      setError(err.message || 'Impossible de quitter le foyer');
    } finally {
      setHouseholdSubmitting(false);
    }
  };

  const handleAddExcludedKeyword = async (e) => {
    e.preventDefault();
    const keyword = keywordInput.trim();
    if (!keyword) return;

    setKeywordSubmitting(true);
    setError(null);
    try {
      await api.addExcludedKeyword(keyword);
      const data = await api.listExcludedKeywords();
      setExcludedKeywords(data?.keywords || []);
      setKeywordInput('');
    } catch (err) {
      setError(err.message || 'Impossible d\'ajouter ce mot-clé');
    } finally {
      setKeywordSubmitting(false);
    }
  };

  const handleDeleteExcludedKeyword = async (keywordId) => {
    setKeywordSubmitting(true);
    setError(null);
    try {
      await api.deleteExcludedKeyword(keywordId);
      const data = await api.listExcludedKeywords();
      setExcludedKeywords(data?.keywords || []);
    } catch (err) {
      setError(err.message || 'Impossible de supprimer ce mot-clé');
    } finally {
      setKeywordSubmitting(false);
    }
  };

  const handleMonthChange = (m, y) => {
    setMonth(m);
    setYear(y);
  };

  const handleDeleteExpense = async (expenseId) => {
    const shouldDelete = window.confirm('Supprimer cette dépense ?');
    if (!shouldDelete) return;

    try {
      await api.deleteExpense(expenseId);
      await fetchData(month, year);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleValidateExpense = async (expenseId) => {
    try {
      await api.updateExpense(expenseId, { category: 'PERSO' });
      await fetchData(month, year);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditExpense = async (expense) => {
    setError(null);
    setEditingExpenseId(expense.id);
    setEditForm({
      title: expense.title || '',
      amount: String(expense.amount ?? ''),
      date: expense.date ? new Date(expense.date).toISOString().slice(0, 10) : '',
      details: expense.details || '',
      tag: expense.tag || 'autre',
      category: expense.category === 'COMMUN' ? 'COMMUN' : 'PERSO',
    });
    setIsEditOpen(true);
  };

  const handleEditFieldChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseEditModal = () => {
    if (editSubmitting) return;
    setIsEditOpen(false);
    setEditingExpenseId(null);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(String(editForm.amount).replace(',', '.'));
    if (!Number.isFinite(parsedAmount)) {
      setError('Montant invalide');
      return;
    }

    if (!['PERSO', 'COMMUN'].includes(editForm.category)) {
      setError('Catégorie invalide');
      return;
    }

    setEditSubmitting(true);
    try {
      await api.updateExpense(editingExpenseId, {
        title: editForm.title.trim(),
        amount: parsedAmount,
        date: editForm.date,
        details: editForm.details,
        tag: editForm.tag,
        category: editForm.category,
      });
      setIsEditOpen(false);
      setEditingExpenseId(null);
      await fetchData(month, year);
    } catch (err) {
      setError(err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Chargement de vos données...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error-state">
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  const dailyData = (stats?.dailyTrend || []).map(d => ({
    ...d,
    day: formatDate(d.day),
  }));

  const isExpenses = chartView === 'expenses';
  const trendKey = isExpenses ? 'expenses' : 'income';
  const trendColor = isExpenses ? '#6366f1' : '#22c55e';
  const trendLabel = isExpenses ? 'Dépenses' : 'Revenus';

  const rawTagData = isExpenses
    ? (stats?.byTag?.expenses || [])
    : (stats?.byTag?.income || []);
  const tagData = rawTagData.map(t => ({
    ...t,
    total: Math.abs(t.total),
    fill: getTagColor(t.tag),
  }));

  const toggleChartView = () =>
    setChartView(v => (v === 'expenses' ? 'income' : 'expenses'));

  const CustomPieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { tag, total } = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <span className="custom-tooltip__label">{tag}</span>
        <span className="custom-tooltip__value">{formatCurrency(total)}</span>
      </div>
    );
  };

  const hasHousehold = Boolean(householdData?.householdId);
  const isHouseholdAdmin = Boolean(householdData?.isHouseholdAdmin);
  const currentUserId = householdData?.currentUserId;

  return (
    <Layout>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header__title">
            {isFoyerView ? 'Foyer' : `Bonjour, ${privateData?.user?.name} 👋`}
          </h1>
          <p className="page-header__subtitle">
            {isFoyerView ? 'Dépenses du foyer' : 'Vos dépenses perso + communes'}
          </p>
        </div>
        <div className="page-header__controls">
          <MonthPicker month={month} year={year} onChange={handleMonthChange} />
        </div>
      </div>

      {isFoyerView && (
        <>
          {!hasHousehold && (
            <div className="card household-card-spacing">
              <div className="card__header">
                <h3 className="card__title">Créer mon foyer</h3>
              </div>
              <div className="card__body household-create">
                <p>Créez un foyer pour gérer les membres et les dépenses communes.</p>
                <button className="household-btn" type="button" onClick={handleCreateHousehold} disabled={householdSubmitting}>
                  {householdSubmitting ? 'Création...' : 'Créer le foyer'}
                </button>
              </div>
            </div>
          )}

          {hasHousehold && (
            <>
              {isHouseholdAdmin && (
                <div className="card household-card-spacing">
                  <div className="card__header">
                    <h3 className="card__title">Ajouter un membre</h3>
                  </div>
                  <div className="card__body">
                    <form className="household-form" onSubmit={handleAddMember}>
                      <input
                        className="household-input"
                        type="email"
                        placeholder="Adresse mail du membre"
                        value={householdEmail}
                        onChange={(e) => setHouseholdEmail(e.target.value)}
                        required
                      />
                      <button className="household-btn" type="submit" disabled={householdSubmitting}>
                        Ajouter au foyer
                      </button>
                    </form>
                  </div>
                </div>
              )}

              <div className="card household-card-spacing">
                <div className="card__header">
                  <h3 className="card__title">Membres du foyer</h3>
                  <span className="card__count">{householdData?.members?.length || 0}</span>
                </div>
                <div className="card__body household-members-list">
                  {(householdData?.members || []).map((member) => (
                    <div className="household-member-row" key={member.id}>
                      <div className="household-member-row__info">
                        <strong>{member.name}</strong>
                        <span>{member.email}</span>
                        {member.isHouseholdAdmin && (
                          <span className="household-member-row__badge">Admin du foyer</span>
                        )}
                      </div>
                      {isHouseholdAdmin && !member.isHouseholdAdmin && member.id !== currentUserId && (
                        <button
                          className="household-btn household-btn--danger"
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={householdSubmitting}
                        >
                          Retirer
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card household-card-spacing">
                <div className="card__header">
                  <h3 className="card__title">Quitter le foyer</h3>
                </div>
                <div className="card__body household-leave">
                  <p>Vous pouvez quitter le foyer à tout moment.</p>
                  <button
                    className="household-btn household-btn--danger"
                    type="button"
                    onClick={handleLeaveHousehold}
                    disabled={householdSubmitting}
                  >
                    Quitter le foyer
                  </button>
                </div>
              </div>
            </>
          )}

          {householdSuccess && <div className="household-feedback household-feedback--success">{householdSuccess}</div>}
        </>
      )}

      {!isFoyerView && (
        <div className="card keyword-card">
          <div className="card__header">
            <h3 className="card__title">Mots-clés exclus</h3>
          </div>
          <div className="card__body keyword-card__body">
            <p className="keyword-card__hint">
              Les nouvelles dépenses contenant un de ces mots-clés seront automatiquement mises en attente de validation.
            </p>

            <form className="keyword-form" onSubmit={handleAddExcludedKeyword}>
              <input
                className="keyword-input"
                type="text"
                placeholder="Ex: amazon, uber, retrait"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
              />
              <button className="keyword-btn" type="submit" disabled={keywordSubmitting}>
                Ajouter
              </button>
            </form>

            <div className="keyword-list">
              {excludedKeywords.length === 0 ? (
                <p className="keyword-empty">Aucun mot-clé exclu</p>
              ) : (
                excludedKeywords.map((item) => (
                  <div className="keyword-item" key={item.id}>
                    <span>{item.keyword}</span>
                    <button
                      className="keyword-btn keyword-btn--danger"
                      type="button"
                      onClick={() => handleDeleteExcludedKeyword(item.id)}
                      disabled={keywordSubmitting}
                    >
                      Retirer
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="stats-grid">
        <StatCard
          label="Total dépensé"
          value={formatCurrency(Math.abs(stats?.summary?.total || 0))}
          icon={<Wallet size={20} />}
          accent="danger"
        />
        <StatCard
          label="Nombre de dépenses"
          value={stats?.summary?.count || 0}
          icon={<Receipt size={20} />}
          accent="accent"
        />
        <StatCard
          label="Dépense moyenne"
          value={formatCurrency(Math.abs(stats?.summary?.average || 0))}
          icon={<ArrowDownUp size={20} />}
          accent="default"
        />
        <StatCard
          label="Plus grosse dépense"
          value={formatCurrency(Math.abs(stats?.summary?.min || 0))}
          icon={<TrendingDown size={20} />}
          accent="warning"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Daily trend */}
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Évolution journalière</h3>
            <button className="chart-view-toggle" onClick={toggleChartView}>
              <ChevronLeft size={16} />
              <span>{isExpenses ? '💸 Dépenses' : '💰 Revenus'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="card__body">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={trendColor} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={trendColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    tickFormatter={(v) => `${v}€`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#18181b',
                      border: '1px solid #2a2a2e',
                      borderRadius: '8px',
                      color: '#fafafa',
                      fontSize: '13px',
                    }}
                    labelStyle={{ color: '#a1a1aa' }}
                    itemStyle={{ color: '#fafafa' }}
                    formatter={(value) => [`${value.toFixed(2)} €`, trendLabel]}
                  />
                  <Area
                    type="monotone"
                    dataKey={trendKey}
                    stroke={trendColor}
                    strokeWidth={2}
                    fill="url(#colorTrend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="chart-empty">Pas de données pour cette période</p>
            )}
          </div>
        </div>

        {/* Tag/category breakdown */}
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Par catégorie</h3>
            <button className="chart-view-toggle" onClick={toggleChartView}>
              <ChevronLeft size={16} />
              <span>{isExpenses ? '💸 Dépenses' : '💰 Revenus'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="card__body card__body--center">
            {tagData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={tagData}
                      dataKey="total"
                      nameKey="tag"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      label={({ tag, percent }) => `${tag} ${(percent * 100).toFixed(0)}%`}
                    >
                      {tagData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {tagData.map((t) => (
                    <div className="pie-legend__item" key={t.tag}>
                      <span
                        className="pie-legend__dot"
                        style={{ background: t.fill }}
                      />
                      <span className="pie-legend__label">{t.tag}</span>
                      <span className="pie-legend__value">{formatCurrency(t.total)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="chart-empty">Pas de données</p>
            )}
          </div>
        </div>
      </div>

      {/* Expense list */}
      <div className="card">
        <div className="card__header">
          <h3 className="card__title">Transactions récentes</h3>
          <span className="card__count">{privateData?.expenses?.length || 0}</span>
        </div>
        <ExpenseList
          expenses={privateData?.expenses}
          showPaidBy={isFoyerView}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
          onValidate={handleValidateExpense}
        />
      </div>

      {isEditOpen && (
        <div className="edit-expense-modal__overlay" onClick={handleCloseEditModal}>
          <div className="edit-expense-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-expense-modal__header">
              <h3 className="edit-expense-modal__title">Modifier la dépense</h3>
            </div>

            <form className="edit-expense-form" onSubmit={handleSubmitEdit}>
              <div className="edit-expense-form__group">
                <label>Titre</label>
                <input
                  className="edit-expense-form__input"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditFieldChange}
                  required
                />
              </div>

              <div className="edit-expense-form__row">
                <div className="edit-expense-form__group">
                  <label>Montant</label>
                  <input
                    className="edit-expense-form__input"
                    name="amount"
                    value={editForm.amount}
                    onChange={handleEditFieldChange}
                    required
                  />
                </div>
                <div className="edit-expense-form__group">
                  <label>Date</label>
                  <input
                    className="edit-expense-form__input"
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleEditFieldChange}
                  />
                </div>
              </div>

              <div className="edit-expense-form__row">
                <div className="edit-expense-form__group">
                  <label>Catégorie</label>
                  <select
                    className="edit-expense-form__input"
                    name="category"
                    value={editForm.category}
                    onChange={handleEditFieldChange}
                  >
                    <option value="PERSO">PERSO</option>
                    <option value="COMMUN">COMMUN</option>
                  </select>
                </div>
                <div className="edit-expense-form__group">
                  <label>Tag</label>
                  <select
                    className="edit-expense-form__input"
                    name="tag"
                    value={editForm.tag}
                    onChange={handleEditFieldChange}
                  >
                    {TAG_LIST.map((tag) => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="edit-expense-form__group">
                <label>Détails</label>
                <textarea
                  className="edit-expense-form__input edit-expense-form__textarea"
                  name="details"
                  value={editForm.details}
                  onChange={handleEditFieldChange}
                  rows={4}
                />
              </div>

              <div className="edit-expense-form__actions">
                <button
                  type="button"
                  className="edit-expense-form__btn edit-expense-form__btn--ghost"
                  onClick={handleCloseEditModal}
                  disabled={editSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="edit-expense-form__btn edit-expense-form__btn--primary"
                  disabled={editSubmitting}
                >
                  {editSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Dashboard;