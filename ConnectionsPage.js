import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getAuthenticatedClient = () => {
    const token = localStorage.getItem('authToken');
    return axios.create({
        baseURL: 'http://127.0.0.1:5000',
        headers: { Authorization: `Bearer ${token}` }
    });
};

function ConnectionsPage() {
    // Jira State
    const [jiraUser, setJiraUser] = useState('');
    const [jiraToken, setJiraToken] = useState('');
    const [jiraUrl, setJiraUrl] = useState('');
    const [jiraProject, setJiraProject] = useState('');

    // Bitbucket State
    const [bitbucketUser, setBitbucketUser] = useState('');
    const [bitbucketPass, setBitbucketPass] = useState('');
    const [bitbucketWorkspace, setBitbucketWorkspace] = useState('');
    const [bitbucketRepo, setBitbucketRepo] = useState('');

    // UI State
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const client = getAuthenticatedClient();
                const response = await client.get('/api/authorizations');
                const { data } = response;
                setJiraUser(data.jira_user || '');
                setJiraUrl(data.jira_url || '');
                setJiraProject(data.jira_project || '');
                setBitbucketUser(data.bitbucket_user || '');
                setBitbucketWorkspace(data.bitbucket_workspace || '');
                setBitbucketRepo(data.bitbucket_repo || '');
            } catch (error) {
                setMessage('Could not load existing connection details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchConnections();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const payload = {
            jira_user: jiraUser,
            jira_url: jiraUrl,
            jira_project: jiraProject,
            bitbucket_user: bitbucketUser,
            bitbucket_workspace: bitbucketWorkspace,
            bitbucket_repo: bitbucketRepo,
        };
        if (jiraToken) payload.jira_token = jiraToken;
        if (bitbucketPass) payload.bitbucket_pass = bitbucketPass;

        try {
            const client = getAuthenticatedClient();
            await client.post('/api/authorizations', payload);
            setMessage('Your credentials have been saved successfully!');
            setJiraToken('');
            setBitbucketPass('');
        } catch (error) {
            setMessage(error.response?.data?.error || 'Failed to save credentials.');
        }
    };
    
    if (isLoading) {
        return <div className="text-center p-8">Loading...</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Manage Connections</h2>
            <p className="text-gray-600 mb-8">
                Connect your Atlassian accounts. Your API tokens and passwords are encrypted and stored securely.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Jira Section */}
                <div className="p-6 border rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-blue-600">Jira Connection</h3>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold">Jira Email</label>
                        <input type="email" value={jiraUser} onChange={(e) => setJiraUser(e.target.value)} className="w-full p-2 border rounded-lg mt-1" placeholder="e.g., your.name@company.com" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold">Jira API Token</label>
                        <input type="password" value={jiraToken} onChange={(e) => setJiraToken(e.target.value)} className="w-full p-2 border rounded-lg mt-1" placeholder="Enter a new token to update" />
                        <p className="text-xs text-gray-500 mt-1">Leave blank to keep your existing token.</p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold">Jira Domain URL</label>
                        <input type="text" value={jiraUrl} onChange={(e) => setJiraUrl(e.target.value)} className="w-full p-2 border rounded-lg mt-1" placeholder="e.g., your-company.atlassian.net" required />
                    </div>
                     <div className="mb-4">
                        <label className="block text-gray-700 font-semibold">Jira Project Key</label>
                        <input type="text" value={jiraProject} onChange={(e) => setJiraProject(e.target.value)} className="w-full p-2 border rounded-lg mt-1" placeholder="e.g., OPS, PROJ" required />
                    </div>
                </div>

                {/* Bitbucket Section */}
                <div className="p-6 border rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-purple-600">Bitbucket Connection</h3>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold">Bitbucket Username</label>
                        <input type="text" value={bitbucketUser} onChange={(e) => setBitbucketUser(e.target.value)} className="w-full p-2 border rounded-lg mt-1" placeholder="Your Bitbucket username" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold">Bitbucket App Password</label>
                        <input type="password" value={bitbucketPass} onChange={(e) => setBitbucketPass(e.target.value)} className="w-full p-2 border rounded-lg mt-1" placeholder="Enter a new password to update" />
                        <p className="text-xs text-gray-500 mt-1">Leave blank to keep your existing password.</p>
                    </div>
                    {/* --- NEW FIELDS FOR BITBUCKET --- */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold">Bitbucket Workspace Slug</label>
                        <input type="text" value={bitbucketWorkspace} onChange={(e) => setBitbucketWorkspace(e.target.value)} className="w-full p-2 border rounded-lg mt-1" placeholder="Your workspace ID (from URL)" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold">Bitbucket Repository Slug</label>
                        <input type="text" value={bitbucketRepo} onChange={(e) => setBitbucketRepo(e.target.value)} className="w-full p-2 border rounded-lg mt-1" placeholder="Your repository name (from URL)" required />
                    </div>
                </div>

                <button type="submit" className="w-full bg-green-500 text-white p-3 rounded-lg font-semibold hover:bg-green-600">
                    Save Connections
                </button>
                {message && <p className="mt-4 text-center text-blue-600 font-semibold">{message}</p>}
            </form>
        </div>
    );
}

export default ConnectionsPage;

