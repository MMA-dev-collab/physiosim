import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './AdminDevices.css';

export default function AdminDevices({ auth }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetting, setResetting] = useState(false);

    useEffect(() => {
        if (auth?.token) {
            fetchUsers();
        }
    }, [auth]);

    const fetchUsers = async () => {
        try {
            const token = auth.token;
            const { data } = await axios.get(`${API_BASE_URL}/api/admin/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            setUsers(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setLoading(false);
        }
    };

    const handleResetDevices = async (userId) => {
        setResetting(true);
        try {
            const token = auth.token;
            await axios.post(
                `${API_BASE_URL}/api/admin/users/${userId}/reset-devices`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'ngrok-skip-browser-warning': 'true'
                    }
                }
            );

            // Refresh user list
            await fetchUsers();
            setShowResetModal(false);
            alert('✅ Device locks reset successfully! User tokens invalidated.');
        } catch (err) {
            console.error('Failed to reset devices:', err);
            alert('❌ Error resetting devices: ' + (err.response?.data?.message || err.message));
        } finally {
            setResetting(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.deviceInfo?.device1?.ip?.includes(searchTerm) ||
        user.deviceInfo?.device2?.ip?.includes(searchTerm)
    );

    const getDeviceStatus = (device) => {
        if (!device) return { label: 'Not Set', className: 'not-set' };
        if (device.active) return { label: 'Active', className: 'active' };
        return { label: 'Inactive', className: 'inactive' };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    return (
        <div className="admin-devices-page">
            <div className="page-header">
                <div>
                    <h1>🔒 Device Management</h1>
                    <p>Monitor and manage user device locks</p>
                </div>
                <button className="btn-refresh" onClick={fetchUsers} disabled={loading}>
                    {loading ? '⏳ Loading...' : '🔄 Refresh'}
                </button>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="🔍 Search by email or IP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="stats-summary">
                <div className="stat-card">
                    <span className="stat-label">Total Users</span>
                    <span className="stat-value">{users.length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Locked Accounts</span>
                    <span className="stat-value">
                        {users.filter(u => u.deviceInfo?.locked).length}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Active Devices</span>
                    <span className="stat-value">
                        {users.reduce((sum, u) => sum + (u.deviceInfo?.deviceCount || 0), 0)}
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="loading">⏳ Loading users...</div>
            ) : (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Device 1 (PC/Mobile)</th>
                                <th>Device 2 (PC/Mobile)</th>
                                <th>Lock Status</th>
                                <th>Token Ver</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => {
                                const device1Status = getDeviceStatus(user.deviceInfo.device1);
                                const device2Status = getDeviceStatus(user.deviceInfo.device2);

                                return (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-cell">
                                                <strong>{user.email}</strong>
                                                <span className={`role-badge ${user.role}`}>{user.role}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {user.deviceInfo.device1 ? (
                                                <div className="device-info">
                                                    <code>{user.deviceInfo.device1.ip}</code>
                                                    <span className={`device-status ${device1Status.className}`}>
                                                        {device1Status.label}
                                                    </span>
                                                    <small>Last: {formatDate(user.deviceInfo.device1.lastSeen)}</small>
                                                </div>
                                            ) : (
                                                <span className="not-set">—</span>
                                            )}
                                        </td>
                                        <td>
                                            {user.deviceInfo.device2 ? (
                                                <div className="device-info">
                                                    <code>{user.deviceInfo.device2.ip}</code>
                                                    <span className={`device-status ${device2Status.className}`}>
                                                        {device2Status.label}
                                                    </span>
                                                    <small>Last: {formatDate(user.deviceInfo.device2.lastSeen)}</small>
                                                </div>
                                            ) : (
                                                <span className="not-set">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`lock-badge ${user.deviceInfo.locked ? 'locked' : 'unlocked'}`}>
                                                {user.deviceInfo.locked ? '🔒 Locked' : '🔓 Unlocked'}
                                            </span>
                                        </td>
                                        <td>
                                            <code className="token-version">v{user.deviceInfo.tokenVersion}</code>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-reset"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowResetModal(true);
                                                }}
                                                disabled={user.deviceInfo.deviceCount === 0}
                                                title={user.deviceInfo.deviceCount === 0 ? 'No devices to reset' : 'Reset device locks'}
                                            >
                                                Reset
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                        <div className="no-results">
                            {searchTerm ? `No users found matching "${searchTerm}"` : 'No users found'}
                        </div>
                    )}
                </div>
            )}

            {showResetModal && selectedUser && (
                <div className="modal-overlay" onClick={() => !resetting && setShowResetModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>⚠️ Reset Device Locks</h2>
                        <p>
                            Are you sure you want to reset device locks for:
                            <br />
                            <strong>{selectedUser.email}</strong>?
                        </p>
                        <div className="reset-details">
                            <p><strong>This action will:</strong></p>
                            <ul>
                                <li>✓ Clear both device slots (IP & fingerprint)</li>
                                <li>✓ Invalidate all active tokens</li>
                                <li>✓ Force user to re-login</li>
                                <li>✓ Disable device locking temporarily</li>
                                <li>✓ Increment token version (v{selectedUser.deviceInfo.tokenVersion} → v{selectedUser.deviceInfo.tokenVersion + 1})</li>
                            </ul>
                            <p className="warning-text">
                                ⚡ User will be logged out immediately from all devices!
                            </p>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowResetModal(false)}
                                disabled={resetting}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-confirm"
                                onClick={() => handleResetDevices(selectedUser.id)}
                                disabled={resetting}
                            >
                                {resetting ? '⏳ Resetting...' : 'Confirm Reset'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
