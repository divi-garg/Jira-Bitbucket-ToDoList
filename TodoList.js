import React from 'react';
import DateRangePickerComponent from './DateRangePicker';
import TaskForm from './TaskForm';
import SummaryChart from './SummaryChart'; 

// --- MODIFIED: Accept new props for status filtering ---
function TodoList({ tasks, deleteTask, completeTask, summarizeText, summary, setSummary, onDateRangeChange, addTask, taskStatus, onStatusChange }) {

  const handleSummarize = () => {
    const summaryText = tasks.map(task => task.text).join('\n');
    summarizeText(summaryText);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
      
      {/* --- COLUMN 1: Task Management --- */}
      <div className="md:col-span-3">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">My Tasks</h3>
        <TaskForm addTask={addTask} />

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mt-6">
          <ul>
            {tasks.length > 0 ? tasks.map(task => (
              <li key={task.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                <div className="flex items-center flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => completeTask(task.id)}
                    className="mr-4 h-5 w-5 text-blue-600 rounded-sm focus:ring-blue-500 flex-shrink-0"
                  />
                  <span className={`text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {task.text}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-500 hover:text-red-500 transition-colors font-semibold ml-4"
                >
                  Delete
                </button>
              </li>
            )) : <p className="text-gray-500 text-center py-4">No tasks yet. Add one above!</p>}
          </ul>
        </div>
      </div>

      {/* --- COLUMN 2: Summary & Controls --- */}
      <div className="md:col-span-2">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Actions & Summary</h3>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            {/* --- NEW: Container for filters --- */}
            <div className="space-y-4">
              <DateRangePickerComponent onDateRangeChange={onDateRangeChange} />
              
              {/* --- NEW: Status filter dropdown --- */}
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Filter by Status:</p>
                <select 
                  value={taskStatus}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="p-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSummarize}
              className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors mt-6"
            >
              Summarize
            </button>
        </div>

        <div className="p-4 mt-6 bg-white rounded-lg shadow border border-gray-200">
          <SummaryChart tasks={tasks} />
        </div>

        {summary && (
          <div className="p-4 mt-6 bg-yellow-100 rounded-lg shadow border border-yellow-200">
            <h3 className="font-semibold text-lg mb-2">Summary:</h3>
            <p className="text-gray-800 whitespace-pre-wrap">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TodoList;