import React from 'react';
import DateRangePickerComponent from './DateRangePicker';
import UserDropdown from './UserDropdown';
import StatusDropdown from './StatusDropdown';
import { FaTasks } from 'react-icons/fa'; 

function JiraPage({ 
    issues, 
    summarizeText, 
    summary, 
    onDateRangeChange,
    selectedUser,
    onUserChange,
    selectedStatus,
    onStatusChange
}) {

  const handleSummarize = () => {
    const summaryText = issues.map(issue => `${issue.key}: ${issue.fields.summary}`).join('\n');
    summarizeText(summaryText);
  };

  const getStatusColor = (statusName) => {
    const name = statusName.toLowerCase();
    if (name.includes('done') || name.includes('closed')) {
        return 'bg-green-100 text-green-800';
    }
    if (name.includes('in progress') || name.includes('dev')) {
        return 'bg-blue-100 text-blue-800';
    }
    if (name.includes('to do') || name.includes('backlog')) {
        return 'bg-gray-100 text-gray-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
      
      {/* --- COLUMN 1: Filters & Actions --- */}
      <div className="md:col-span-2">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Filters & Actions</h3>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200 space-y-4">
            <DateRangePickerComponent onDateRangeChange={onDateRangeChange} />
            <UserDropdown type="jira" selectedUser={selectedUser} onUserChange={onUserChange} />
            <StatusDropdown selectedStatus={selectedStatus} onStatusChange={onStatusChange} />
            <button
              onClick={handleSummarize}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Summarize
            </button>
        </div>

        {summary && (
            <div className="p-4 mt-6 bg-blue-50 rounded-lg shadow border border-blue-200">
              <h3 className="font-semibold text-lg mb-2 text-blue-800">Summary:</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{summary}</p>
            </div>
        )}
      </div>

      {/* --- COLUMN 2: Jira Issues --- */}
      <div className="md:col-span-3">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Jira Issues</h3>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          {issues.length > 0 ? (
            <ul className="space-y-4">
              {issues.map(issue => (
                <li key={issue.id} className="p-4 border rounded-md hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-800 pr-4">{issue.key}: {issue.fields.summary}</h3>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(issue.fields.status.name)}`}>
                          {issue.fields.status.name}
                      </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                      <FaTasks className="mr-2" />
                      <span>{issue.fields.issuetype.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-center py-4">No Jira issues found. Check your connections or adjust your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default JiraPage;