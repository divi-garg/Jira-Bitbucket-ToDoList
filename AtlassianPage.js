import React, { useState } from 'react';
import JiraPage from './JiraPage';
import BitbucketPage from './BitbucketPage';

function AtlassianPage({
    jiraIssues,
    bitbucketCommits,
    summarizeText,
    summary,
    onDateRangeChange,
    jiraUser,
    setJiraUser,
    bitbucketUser,
    setBitbucketUser,
    jiraStatus,
    setJiraStatus,
}) {
    const [activeTab, setActiveTab] = useState('jira');

    return (
        <div>
            <div className="flex border-b mb-4">
                <button
                    className={`py-2 px-4 ${activeTab === 'jira' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setActiveTab('jira')}
                >
                    Jira
                </button>
                <button
                    className={`py-2 px-4 ${activeTab === 'bitbucket' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setActiveTab('bitbucket')}
                >
                    Bitbucket
                </button>
            </div>
            {activeTab === 'jira' && (
                <JiraPage
                    issues={jiraIssues}
                    summarizeText={summarizeText}
                    summary={summary}
                    onDateRangeChange={onDateRangeChange}
                    selectedUser={jiraUser}
                    onUserChange={setJiraUser}
                    selectedStatus={jiraStatus}
                    onStatusChange={setJiraStatus}
                />
            )}
            {activeTab === 'bitbucket' && (
                <BitbucketPage
                    commits={bitbucketCommits}
                    summarizeText={summarizeText}
                    summary={summary}
                    onDateRangeChange={onDateRangeChange}
                    selectedUser={bitbucketUser}
                    onUserChange={setBitbucketUser}
                />
            )}
        </div>
    );
}

export default AtlassianPage;