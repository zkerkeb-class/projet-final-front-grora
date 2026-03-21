import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router';
import { Receipt, Upload, AlertCircle, Check } from 'lucide-react';

import Layout from '../../components/Layout/Layout.jsx';
import { api } from '../../lib/api.js';
import { TAG_LIST } from '../../lib/utils.js';
import './new_expense.css';

function NewExpense() {
  const navigate = useNavigate();

  const [userID, setUserID] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: '',
    details: '',
    tag: '',
    category: 'PERSO',
    paid_by_user_id: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    try {
      const decoded = jwtDecode(token);
      setUserID(decoded.id);
    } catch {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const expense = { ...formData };
    expense.user_id = userID;
    if (!expense.paid_by_user_id) expense.paid_by_user_id = userID;
    expense.amount = -Math.abs(Number(expense.amount));

    try {
      await api.createExpense(expense);
      setSuccess('Dépense enregistrée !');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFileUpload(file) {
    if (!file) return;
    setError(null);
    setSubmitting(true);

    try {
      const data = await api.uploadCsv(file, userID);
      setSuccess(data.message);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Nouvelle dépense</h1>
          <p className="page-header__subtitle">Ajoutez une dépense manuellement ou importez un relevé CSV</p>
        </div>
      </div>

      <div className="new-expense-grid">
        {/* Manual form */}
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">
              <Receipt size={18} /> Saisie manuelle
            </h3>
          </div>
          <div className="card__body">
            <form className="expense-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Titre</label>
                <input
                  className="form-input"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Courses Carrefour"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Montant (€)</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    className="form-input"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-input"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="PERSO">Personnel</option>
                    <option value="COMMUN">Commun</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <select
                  className="form-input"
                  name="tag"
                  value={formData.tag}
                  onChange={handleChange}
                >
                  <option value="">— Choisir une catégorie —</option>
                  {TAG_LIST.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Détails</label>
                <textarea
                  className="form-input form-textarea"
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  placeholder="Notes supplémentaires..."
                  rows={3}
                />
              </div>

              {formData.category === 'COMMUN' && (
                <div className="form-group">
                  <label className="form-label">Payé par (ID utilisateur)</label>
                  <input
                    className="form-input"
                    type="number"
                    name="paid_by_user_id"
                    value={formData.paid_by_user_id}
                    onChange={handleChange}
                  />
                </div>
              )}

              <button className="btn btn--primary" type="submit" disabled={submitting}>
                {submitting ? <span className="btn-loader" /> : 'Enregistrer la dépense'}
              </button>
            </form>
          </div>
        </div>

        {/* CSV upload */}
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">
              <Upload size={18} /> Import CSV
            </h3>
          </div>
          <div className="card__body">
            <div className="upload-zone">
              <Upload size={40} className="upload-zone__icon" />
              <p className="upload-zone__text">
                Glissez votre relevé bancaire ici ou
              </p>
              <label className="btn btn--outline upload-zone__btn">
                Parcourir
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  hidden
                />
              </label>
              <p className="upload-zone__hint">Format CSV uniquement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="feedback feedback--error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="feedback feedback--success">
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}
    </Layout>
  );
}

export default NewExpense;