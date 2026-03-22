import { useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Layout from '../../components/Layout/Layout.jsx';
import { api } from '../../lib/api.js';
import './admin_dashboard.css';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [temporaryPassword, setTemporaryPassword] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');

  const token = localStorage.getItem('token');
  const currentRole = useMemo(() => {
    try {
      return jwtDecode(token)?.role || 'user';
    } catch {
      return 'user';
    }
  }, [token]);

  const allowedCreateRoles = currentRole === 'superadmin' ? ['user', 'admin'] : ['user'];

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.adminListUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || 'Erreur de chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setTemporaryPassword('');

    try {
      const data = await api.adminCreateUser({
        name,
        email,
        role,
      });

      setTemporaryPassword(data.temporaryPassword || '');
      setName('');
      setEmail('');
      setRole('user');
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création utilisateur');
    }
  };

  const handleRoleChange = async (userId, nextRole) => {
    setError('');
    try {
      await api.adminUpdateRole(userId, nextRole);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour du rôle');
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm('Supprimer cet utilisateur ? Cette action est irréversible.');
    if (!confirmed) return;

    setError('');
    try {
      await api.adminDeleteUser(userId);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression de l\'utilisateur');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Administration</h1>
          <p className="page-header__subtitle">Gestion des utilisateurs et des rôles</p>
        </div>
      </div>

      <div className="admin-grid">
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Créer un utilisateur</h3>
          </div>
          <div className="card__body">
            <form className="admin-form" onSubmit={handleCreateUser}>
              <input
                className="admin-input"
                placeholder="Nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="admin-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <select
                className="admin-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {allowedCreateRoles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button className="admin-btn" type="submit">Créer le compte</button>
            </form>

            {temporaryPassword && (
              <div className="admin-temp-password">
                <strong>Mot de passe temporaire :</strong> {temporaryPassword}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Utilisateurs gérés</h3>
          </div>
          <div className="card__body">
            {loading ? (
              <p>Chargement...</p>
            ) : (
              <div className="admin-users-list">
                {users.map((user) => (
                  <div className="admin-user-item" key={user.id}>
                    <div className="admin-user-item__info">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                      <span className="admin-user-item__meta">household: {user.household_id}</span>
                      {user.first_login_required && (
                        <span className="admin-user-item__pending">Mot de passe temporaire actif</span>
                      )}
                    </div>
                    <div className="admin-user-item__actions">
                      <select
                        className="admin-input admin-input--small"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        {currentRole === 'superadmin' ? (
                          <>
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </>
                        ) : (
                          <option value="user">user</option>
                        )}
                      </select>
                      <button
                        className="admin-btn admin-btn--danger"
                        type="button"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}
    </Layout>
  );
}

export default AdminDashboard;
