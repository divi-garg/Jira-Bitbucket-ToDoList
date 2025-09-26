import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getAuthenticatedClient = () => {
    const token = localStorage.getItem('authToken');
    return axios.create({
        baseURL: 'http://127.0.0.1:5000',
        headers: { Authorization: `Bearer ${token}` }
    });
};

function UserDropdown({ type, selectedUser, onUserChange }) {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const endpoint = type === 'jira' ? '/jira_users' : '/bitbucket_users';
            try {
                const client = getAuthenticatedClient();
                const response = await client.get(endpoint);
                
                // Add the "All Users" option to the start of the list
                const allUsersOption = { 
                    displayName: 'All Users', 
                    nickname: 'All Users',
                    accountId: 'all', // For Jira
                    uuid: 'all' // For Bitbucket
                };
                
                setUsers([allUsersOption, ...response.data]);

            } catch (error) {
                console.error(`Error fetching ${type} users:`, error);
                // If there's an error, just show the "All Users" option
                setUsers([{ displayName: 'All Users', nickname: 'All Users', accountId: 'all', uuid: 'all' }]);
            }
        };

        fetchUsers();
    }, [type]); // Re-fetch if the type changes (though it won't in this app)

    return (
        <select 
            className="p-2 border rounded-lg bg-white"
            value={selectedUser}
            onChange={(e) => onUserChange(e.target.value)}
        >
            {users.map(user => (
                <option 
                    key={user.accountId || user.uuid} 
                    value={user.accountId || user.uuid}
                >
                    {user.displayName || user.nickname}
                </option>
            ))}
        </select>
    );
}

export default UserDropdown;