import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getAuthenticatedClient = () => {
    const token = localStorage.getItem('authToken');
    return axios.create({
        baseURL: 'http://127.0.0.1:5000',
        headers: { Authorization: `Bearer ${token}` }
    });
};

function StatusDropdown({ selectedStatus, onStatusChange }) {
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const client = getAuthenticatedClient();
                const response = await client.get('/jira_statuses');
                
                // Add the "All Statuses" option to the start
                const allStatusesOption = { name: 'All Statuses', id: 'all' };
                setStatuses([allStatusesOption, ...response.data]);

            } catch (error) {
                console.error('Error fetching Jira statuses:', error);
                setStatuses([{ name: 'All Statuses', id: 'all' }]);
            }
        };

        fetchStatuses();
    }, []);

    return (
        <select 
            className="p-2 border rounded-lg bg-white"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
        >
            {statuses.map(status => (
                <option key={status.id} value={status.name}>
                    {status.name}
                </option>
            ))}
        </select>
    );
}

export default StatusDropdown;