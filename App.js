import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TodoList from './components/TodoList';
import Sidebar from './components/Sidebar';
import AtlassianPage from './components/AtlassianPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ConnectionsPage from './components/ConnectionsPage';
import { FaUser } from 'react-icons/fa';

const getAuthenticatedClient = () => {
    const token = localStorage.getItem('authToken');
    return axios.create({
        baseURL: 'http://127.0.0.1:5000',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// --- HEADER COMPONENT ---
const Header = ({ title }) => (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b border-gray-200 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                <FaUser />
            </div>
        </div>
    </header>
);

function AuthenticatedApp() {
    const [page, setPage] = useState('todo');
    const [pageTitle, setPageTitle] = useState('To-Do List'); 
    const [tasks, setTasks] = useState([]);
    const [jiraIssues, setJiraIssues] = useState([]);
    const [bitbucketCommits, setBitbucketCommits] = useState([]);
    const [summary, setSummary] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);
    
    const [taskStatus, setTaskStatus] = useState('all');

    const [jiraUser, setJiraUser] = useState('all');
    const [bitbucketUser, setBitbucketUser] = useState('all');
    const [jiraStatus, setJiraStatus] = useState('All Statuses');

    const fetchTasks = async () => {
        try {
            const client = getAuthenticatedClient();
            const [startDate, endDate] = dateRange;
            
            const params = new URLSearchParams();
            params.append('status', taskStatus); 
            if (startDate) params.append('startDate', startDate.toISOString());
            if (endDate) params.append('endDate', endDate.toISOString());

            const response = await client.get(`/tasks?${params.toString()}`);
            setTasks(response.data);
        } catch (error) { // --- THIS IS THE FIX ---
            console.error('Error fetching tasks:', error);
        }
    };
    
    const fetchAtlassianContent = async () => {
        const client = getAuthenticatedClient();
        const [startDate, endDate] = dateRange;
        
        // --- JIRA ---
        try {
            const jiraParams = new URLSearchParams();
            jiraParams.append('username', jiraUser);
            jiraParams.append('status', jiraStatus);
            if (startDate) jiraParams.append('startDate', startDate.toISOString());
            if (endDate) jiraParams.append('endDate', endDate.toISOString());

            const jiraResponse = await client.get(`/jira_issues?${jiraParams.toString()}`);
            setJiraIssues(jiraResponse.data);
        } catch (error) {
            console.error('Error fetching Jira issues:', error);
            const errorDetails = error.response?.data?.details || error.response?.data?.error || 'Could not fetch issues.';
            alert(`Jira Error: ${errorDetails}`);
            setJiraIssues([]);
        }

        // --- BITBUCKET ---
        try {
            const bitbucketParams = new URLSearchParams();
            bitbucketParams.append('username', bitbucketUser);
            if (startDate) bitbucketParams.append('startDate', startDate.toISOString());
            if (endDate) bitbucketParams.append('endDate', endDate.toISOString());

            const bitbucketResponse = await client.get(`/bitbucket_commits?${bitbucketParams.toString()}`);
            setBitbucketCommits(bitbucketResponse.data);
        } catch (error) {
            console.error('Error fetching Bitbucket commits:', error);
            const errorDetails = error.response?.data?.details || error.response?.data?.error || 'Could not fetch commits.';
            alert(`Bitbucket Error: ${errorDetails}`);
            setBitbucketCommits([]);
        }
    };

    const summarizeText = async (text) => {
        try {
            const client = getAuthenticatedClient();
            const response = await client.post('/summarize', { 
                text: text,
                format: 'concise bullet points'
            });
            setSummary(response.data.summary);
        } catch (error) {
            console.error('Error getting summary:', error);
            setSummary('Failed to generate summary.');
        }
    };

    const addTask = async (text) => {
        try {
            const client = getAuthenticatedClient();
            await client.post('/tasks', { text });
            fetchTasks(); 
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

     const deleteTask = async (id) => {
        try {
            const client = getAuthenticatedClient();
            await client.delete(`/tasks/${id}`);
            setTasks(tasks.filter(task => task.id !== id)); 
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const completeTask = async (id) => {
        try {
            const client = getAuthenticatedClient();
            await client.put(`/tasks/${id}/complete`); 
            setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
        } catch (error) {
            console.error('Error completing task:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        if (page === 'atlassian') {
            fetchAtlassianContent();
        } else if (page === 'todo') {
            fetchTasks();
        }
    }, [page, jiraUser, bitbucketUser, jiraStatus, dateRange, taskStatus]);
    
    const handleSetPage = (pageName) => {
        setPage(pageName);
        switch (pageName) {
            case 'todo':
                setPageTitle('To-Do List');
                break;
            case 'atlassian':
                setPageTitle('Atlassian Dashboard');
                setSummary(''); 
                break;
            case 'connections':
                setPageTitle('Manage Connections');
                break;
            default:
                setPageTitle('Dashboard');
        }
    };

    const renderPage = () => {
        switch (page) {
            case 'todo':
                return <TodoList tasks={tasks} deleteTask={deleteTask} completeTask={completeTask} summarizeText={summarizeText} summary={summary} setSummary={setSummary} onDateRangeChange={setDateRange} addTask={addTask} taskStatus={taskStatus} onStatusChange={setTaskStatus} />;
            case 'atlassian':
                return <AtlassianPage jiraIssues={jiraIssues} bitbucketCommits={bitbucketCommits} summarizeText={summarizeText} summary={summary} onDateRangeChange={setDateRange} jiraUser={jiraUser} setJiraUser={setJiraUser} bitbucketUser={bitbucketUser} setBitbucketUser={setBitbucketUser} jiraStatus={jiraStatus} setJiraStatus={setJiraStatus} />;
            case 'connections':
                return <ConnectionsPage />;
            default:
                return <div>Select a page from the menu.</div>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar page={page} setPage={handleSetPage} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title={pageTitle} />
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {renderPage()}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function AppRouter() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));
    const navigate = useNavigate();

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        navigate('/');
    };

    const handleSignupSuccess = () => {
        navigate('/login');
    };

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);


    return (
        <div className="bg-gray-100 min-h-screen">
            <Routes>
                {isLoggedIn ? (
                    <Route path="*" element={<AuthenticatedApp />} />
                ) : (
                    <>
                        <Route path="/signup" element={<SignupPage onSignup={handleSignupSuccess} />} />
                        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                        <Route path="*" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                    </>
                )}
            </Routes>
        </div>
    );
}