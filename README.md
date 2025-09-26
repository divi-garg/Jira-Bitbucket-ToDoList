# DevFlow: The Integrated Developer Task Hub

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Jira](https://img.shields.io/badge/Jira-0052CC?style=for-the-badge&logo=Jira&logoColor=white)
![Bitbucket](https://img.shields.io/badge/bitbucket-%230047B3.svg?style=for-the-badge&logo=bitbucket&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

DevFlow is a developer-centric task management application built with **React.js** to solve the problem of context switching. By integrating directly with the **Jira and Bitbucket APIs**, it pulls your assigned issues and repository activities into a single, intuitive interface, creating a unified dashboard that streamlines your entire development workflow.

---

## 🎯 The Problem
As developers, our work is often fragmented across multiple platforms:
- **Jira** for tracking stories and bugs.
- **Bitbucket** for managing code, branches, and pull requests.
- **A separate to-do list** for personal notes and micro-tasks.

This constant context-switching kills productivity and makes it difficult to get a clear overview of your daily tasks. DevFlow was built to solve this by consolidating these workflows into one central hub.

## ✨ Key Features

- **Unified Task Dashboard:** A clean, minimalist interface for creating personal to-dos alongside tasks fetched from other services.
- **🚀 Live Jira Integration:**
    - Securely authenticate with your Atlassian account using OAuth 2.0.
    - Automatically fetch and display all Jira issues assigned to you.
    - Filter tasks by Jira project, status (`To Do`, `In Progress`, etc.), or priority.
- **⚙️ Bitbucket Connectivity:**
    - Link your tasks and Jira issues to specific **Bitbucket branches, commits, or pull requests**.
    - View the status of linked pull requests (`Open`, `Merged`, `Declined`) at a glance.
    - Quick-access links to relevant repositories and PRs in Bitbucket.
- **Responsive Design:** A fully responsive, mobile-first design that ensures the app works flawlessly on any device.

## 📸 Demo

*(Here you should add a screenshot or, even better, an animated GIF of your application in action!)*

![Project Demo GIF](https://your-link-to-demo-image-or.gif)

## 🛠️ Tech Stack

| Category          | Technology                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| **Frontend** | `React.js`, `Vite`, `TypeScript` (optional)                                                                   |
| **State Management**| `Zustand` / `Redux Toolkit`                                                                                 |
| **API Client** | `Axios`                                                                                                       |
| **Styling** | `Tailwind CSS` / `Styled-Components`                                                                          |
| **APIs** | `Jira Cloud REST API`, `Bitbucket API 2.0`                                                                    |
| **Authentication**| `OAuth 2.0` for Jira & Bitbucket                                                                              |
| **Deployment** | `Vercel` / `Netlify`                                                                                          |

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A Jira Cloud account and a Bitbucket account to generate API credentials.

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of your project by copying the example file:
    ```sh
    cp .env.example .env
    ```
    Now, open the `.env` file and add your API credentials. You will need to create an OAuth 2.0 app in both your [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/) and your Bitbucket workspace settings.

    ```env
    # .env

    # Jira API Credentials
    REACT_APP_JIRA_CLIENT_ID="your_jira_client_id"
    REACT_APP_JIRA_CLIENT_SECRET="your_jira_client_secret"
    REACT_APP_JIRA_REDIRECT_URI="http://localhost:3000/callback/jira" # or your Vercel URL
    REACT_APP_JIRA_CLOUD_ID="your_atlassian_cloud_id"

    # Bitbucket API Credentials
    REACT_APP_BITBUCKET_CLIENT_ID="your_bitbucket_client_id"
    REACT_APP_BITBUCKET_CLIENT_SECRET="your_bitbucket_client_secret"
    REACT_APP_BITBUCKET_REDIRECT_URI="http://localhost:3000/callback/bitbucket" # or your Vercel URL
    ```

4.  **Run the development server:**
    ```sh
    npm start
    # or
    yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 📈 Future Improvements

- [ ] Support for other Git providers (GitHub, GitLab).
- [ ] Real-time notifications for PR comments or Jira updates.
- [ ] Deeper integration, such as creating branches or commenting on tickets directly from the app.
- [ ] Caching and performance optimizations for faster data fetching.

## 👤 Author

**[Your Name]**

-   GitHub: [@your-username](https://github.com/your-username)
-   LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/your-profile)
-   Website: [your-website.com](https://your-website.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
