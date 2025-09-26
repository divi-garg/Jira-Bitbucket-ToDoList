import React, { useState } from 'react';

function TaskForm({ addTask }) {
  const [taskText, setTaskText] = useState(''); // State to hold input value

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents the page from reloading
    if (taskText.trim()) { // Check if input is not empty
      addTask(taskText);
      setTaskText(''); // Clear the input field
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-4 mb-8">
      <input
        type="text"
        placeholder="Add a new task..."
        value={taskText} // Link input value to state
        onChange={(e) => setTaskText(e.target.value)} // Update state on change
        className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
      >
        Add Task
      </button>
    </form>
  );
}

export default TaskForm;