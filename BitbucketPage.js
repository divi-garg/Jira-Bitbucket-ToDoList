import React from 'react';
import DateRangePickerComponent from './DateRangePicker';
import UserDropdown from './UserDropdown';

function BitbucketPage({ commits, summarizeText, summary, onDateRangeChange, selectedUser, onUserChange }) {
  
  const handleSummarize = () => {
    const summaryText = commits.map(commit => `${commit.hash.substring(0, 7)}: ${commit.message}`).join('\n');
    summarizeText(summaryText);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
      
      {/* --- COLUMN 1: Filters & Actions --- */}
      <div className="md:col-span-2">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Filters & Actions</h3>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200 space-y-4">
            <DateRangePickerComponent onDateRangeChange={onDateRangeChange} />
            <UserDropdown type="bitbucket" selectedUser={selectedUser} onUserChange={onUserChange} />
            <button
              onClick={handleSummarize}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Summarize
            </button>
        </div>

        {summary && (
            <div className="p-4 mt-6 bg-indigo-50 rounded-lg shadow border border-indigo-200">
                <h3 className="font-semibold text-lg mb-2 text-indigo-800">Summary:</h3>
                <p className="text-gray-800 whitespace-pre-wrap">{summary}</p>
            </div>
        )}
      </div>

      {/* --- COLUMN 2: Bitbucket Commits --- */}
      <div className="md:col-span-3">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Bitbucket Commits</h3>
        <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
          {commits.length > 0 ? (
            <ul>
              {commits.map(commit => (
                <li key={commit.hash} className="p-4 border-b last:border-b-0">
                  <h3 className="font-semibold text-gray-800">{commit.message}</h3>
                  <p className="text-gray-600 mt-1">Author: {commit.author.user ? commit.author.user.display_name : 'N/A'}</p>
                  <p className="text-gray-500 text-sm">Date: {new Date(commit.date).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-center py-4">No Bitbucket commits found. Check your connections.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BitbucketPage;