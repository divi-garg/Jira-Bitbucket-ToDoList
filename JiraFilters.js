import React, { useState, useEffect } from 'react';
import axios from 'axios';

function JiraFilters({ selectedUser, onUserChange, selectedStatus, onStatusChange }) {
    const [users, setUsers] = useState([]);
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/jira_metadata');
                let userList = response.data.users;
                let statusList = response.data.statuses;
                
                // Add "All Users" option
                userList = [{ displayName: 'All Users', accountId: 'all' }, ...userList];
                setUsers(userList);

                // Add "All Statuses" option
                statusList = [{ name: 'All Statuses', id: 'all' }, ...statusList];
                setStatuses(statusList);
            } catch (error) {
                console.error('Error fetching Jira metadata:', error);
            }
        };

        fetchMetadata();
    }, []);

    return (
        <>
            <div className="flex space-x-2">
                <select 
                    className="p-2 border rounded-lg"
                    value={selectedUser}
                    onChange={(e) => onUserChange(e.target.value)}
                >
                    {users.map(user => (
                        <option 
                            key={user.accountId} 
                            value={user.accountId}
                        >
                            {user.displayName}
                        </option>
                    ))}
                </select>
                <select 
                    className="p-2 border rounded-lg"
                    value={selectedStatus}
                    onChange={(e) => onStatusChange(e.target.value)}
                >
                    {statuses.map(status => (
                        <option key={status.id} value={status.name}>
                            {status.name}
                        </option>
                    ))}
                </select>
            </div>
        </>
    );
}

export default JiraFilters;