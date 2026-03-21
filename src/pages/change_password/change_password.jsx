import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import './change_password.css';

function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('La confirmation du mot de passe ne correspond pas.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.changePassword(currentPassword, newPassword);
      localStorage.setItem('token', data.token);
      setSuccess('Mot de passe mis à jour. Redirection...');
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="change-password-card">
        <h1 className="change-password-card__title">Changement obligatoire du mot de passe</h1>
        <p className="change-password-card__subtitle">
          Votre compte utilise un mot de passe temporaire. Définissez un mot de passe personnel.
        </p>

        <form className="change-password-form" onSubmit={handleSubmit}>
          <label className="change-password-form__label">Mot de passe temporaire</label>
          <div className="change-password-input">
            <Lock size={16} />
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <label className="change-password-form__label">Nouveau mot de passe</label>
          <div className="change-password-input">
            <Lock size={16} />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <label className="change-password-form__label">Confirmer le mot de passe</label>
          <div className="change-password-input">
            <Lock size={16} />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="change-password-feedback change-password-feedback--error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="change-password-feedback change-password-feedback--success">
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          <button type="submit" className="change-password-btn" disabled={loading}>
            {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
