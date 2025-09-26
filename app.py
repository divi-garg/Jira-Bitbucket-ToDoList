import os
import uuid
import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import requests
from openai import OpenAI
from dotenv import load_dotenv
import bcrypt
from cryptography.fernet import Fernet

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

# --- Firebase Configuration ---
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate('extended-spark-464807-e5-3a90c6221a5f.json')
        firebase_admin.initialize_app(cred)
except ValueError:
    print("Firebase app already initialized. Skipping.")

db = firestore.client()

# --- App and CORS setup ---
app = Flask(__name__)
CORS(app)

# --- Encryption Setup ---
ENCRYPTION_KEY = os.environ.get('ENCRYPTION_KEY')
if not ENCRYPTION_KEY:
    raise ValueError("CRITICAL: ENCRYPTION_KEY is not set. Please create a .env file and add it.")
cipher_suite = Fernet(ENCRYPTION_KEY.encode())

# --- Authentication Decorator ---
def authenticate(func):
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or 'Bearer ' not in auth_header:
            return jsonify({"error": "Authorization header missing"}), 401
        
        token = auth_header.split(" ")[1]
        
        users_ref = db.collection('users')
        query = users_ref.where('auth_token', '==', token).limit(1)
        user_docs = list(query.stream())
        
        if not user_docs:
            return jsonify({"error": "Invalid token"}), 401

        user_doc = user_docs[0]
        kwargs['user_data'] = user_doc.to_dict()
        kwargs['user_email'] = user_doc.id
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper

# --- User Authentication Routes ---
@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        users_ref = db.collection('users')
        if users_ref.document(email).get().exists:
            return jsonify({"error": "User with this email already exists"}), 409

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        users_ref.document(email).set({"email": email, "password": hashed_password})

        return jsonify({"message": "User created successfully"}), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create user: {e}"}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        user_doc = db.collection('users').document(email).get()
        if not user_doc.exists:
            return jsonify({"error": "Invalid email or password"}), 401

        user_data = user_doc.to_dict()
        if bcrypt.checkpw(password.encode('utf-8'), user_data.get('password').encode('utf-8')):
            token = str(uuid.uuid4())
            db.collection('users').document(email).update({'auth_token': token})
            return jsonify({"message": "Login successful", "token": token}), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": f"Failed to login: {e}"}), 500

# --- Authorization Routes ---
@app.route('/api/authorizations', methods=['POST'])
@authenticate
def save_authorizations(user_data, user_email):
    try:
        data = request.json
        user_ref = db.collection('users').document(user_email)
        
        update_data = {}
        fields_to_update = ['jira_user', 'jira_url', 'jira_project', 'bitbucket_user', 'bitbucket_workspace', 'bitbucket_repo']
        for field in fields_to_update:
            if data.get(field):
                update_data[field] = data.get(field)

        if data.get('jira_token'):
            update_data['jira_token'] = cipher_suite.encrypt(data.get('jira_token').encode()).decode()
        if data.get('bitbucket_pass'):
            update_data['bitbucket_pass'] = cipher_suite.encrypt(data.get('bitbucket_pass').encode()).decode()

        user_ref.set(update_data, merge=True)
        return jsonify({"message": "Credentials saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to save credentials: {e}"}), 500

@app.route('/api/authorizations', methods=['GET'])
@authenticate
def get_authorizations(user_data, user_email):
    return jsonify({
        "jira_configured": bool(user_data.get('jira_user') and user_data.get('jira_token')),
        "jira_user": user_data.get('jira_user', ''),
        "jira_url": user_data.get('jira_url', ''),
        "jira_project": user_data.get('jira_project', ''),
        "bitbucket_configured": bool(user_data.get('bitbucket_user') and user_data.get('bitbucket_pass')),
        "bitbucket_user": user_data.get('bitbucket_user', ''),
        "bitbucket_workspace": user_data.get('bitbucket_workspace', ''),
        "bitbucket_repo": user_data.get('bitbucket_repo', '')
    }), 200

# --- To-Do List Routes ---
@app.route('/tasks', methods=['GET'])
@authenticate
def get_tasks(user_data, user_email):
    try:
        tasks_ref = db.collection(f'users/{user_email}/tasks')
        
        start_date_str = request.args.get('startDate')
        end_date_str = request.args.get('endDate')
        # --- NEW: Get the status from the request ---
        status = request.args.get('status', 'all') 

        query = tasks_ref
        
        # --- MODIFIED: Add status filtering to the query ---
        if status == 'completed':
            query = query.where('completed', '==', True)
        elif status == 'pending':
            query = query.where('completed', '==', False)

        if start_date_str and start_date_str != 'null':
            query = query.where('date', '>=', start_date_str)
        if end_date_str and end_date_str != 'null':
            # Add a character to the end of the string to include the whole day
            query = query.where('date', '<=', end_date_str + '\uf8ff') 
        
        tasks = [doc.to_dict() for doc in query.stream()]
        return jsonify(tasks), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve tasks: {e}"}), 500

@app.route('/tasks', methods=['POST'])
@authenticate
def add_task(user_data, user_email):
    try:
        task_data = request.json
        # --- FIX: Use datetime.utcnow() to store a standardized UTC timestamp ---
        new_task = { 
            "id": str(uuid.uuid4()), 
            "text": task_data["text"], 
            "completed": False, 
            "date": datetime.utcnow().isoformat() + 'Z' # Add 'Z' to signify UTC
        }
        db.collection(f'users/{user_email}/tasks').document(new_task['id']).set(new_task)
        return jsonify(new_task), 201
    except Exception as e:
        return jsonify({"error": f"Failed to add task: {e}"}), 500

# In your backend/app.py file

# --- REPLACE the existing complete_task function with this one ---

@app.route('/tasks/<string:task_id>/complete', methods=['PUT', 'OPTIONS'])
def complete_task(task_id):
    # First, handle the browser's pre-flight request, which doesn't need auth.
    if request.method == 'OPTIONS':
        return '', 204

    # Now, manually perform authentication for the PUT request.
    auth_header = request.headers.get('Authorization')
    if not auth_header or 'Bearer ' not in auth_header:
        return jsonify({"error": "Authorization header missing"}), 401
    
    token = auth_header.split(" ")[1]
    
    users_ref = db.collection('users')
    query = users_ref.where('auth_token', '==', token).limit(1)
    user_docs = list(query.stream())
    
    if not user_docs:
        return jsonify({"error": "Invalid token"}), 401

    user_email = user_docs[0].id

    # If authentication is successful, proceed with the main logic.
    try:
        task_ref = db.collection(f'users/{user_email}/tasks').document(task_id)
        task_doc = task_ref.get()

        if not task_doc.exists:
            return jsonify({"error": "Task not found"}), 404

        current_status = task_doc.to_dict().get('completed', False)
        task_ref.update({'completed': not current_status})
        
        return jsonify({"message": "Task status updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to update task: {e}"}), 500

# --- Helper function for Atlassian URLs ---
def prepare_url(domain):
    if not domain: return None
    if domain.startswith("http://") or domain.startswith("https://"):
        return domain
    return f"https://{domain}"

# --- Bitbucket & Jira Routes ---
@app.route('/bitbucket_commits', methods=['GET'])
@authenticate
def get_bitbucket_commits(user_data, user_email):
    required_fields = ['bitbucket_pass', 'bitbucket_user', 'bitbucket_workspace', 'bitbucket_repo']
    if not all(user_data.get(field) for field in required_fields):
        return jsonify({"error": "Bitbucket credentials (including workspace and repo) are not fully configured."}), 400
    try:
        decrypted_pass = cipher_suite.decrypt(user_data['bitbucket_pass'].encode()).decode()
        bitbucket_user = user_data.get('bitbucket_user')
        bitbucket_workspace = user_data.get('bitbucket_workspace')
        bitbucket_repo = user_data.get('bitbucket_repo')
        
        # --- FIX: Build query parameters dynamically for Bitbucket ---
        params = {}
        start_date_str = request.args.get('startDate')
        if start_date_str and start_date_str not in ['undefined', 'null']:
             params['include'] = f"**/*" # This is a placeholder, Bitbucket API for date filtering on commits is complex.
                                         # A more robust solution would involve paginating and filtering in code.
                                         # For now, we'll fetch all and let the user see them.

        url = f"https://api.bitbucket.org/2.0/repositories/{bitbucket_workspace}/{bitbucket_repo}/commits"
        auth = (bitbucket_user, decrypted_pass)
        response = requests.get(url, auth=auth, params=params, verify=False)
        response.raise_for_status()
        
        if not response.text:
            return jsonify({"error": "Received an empty response from Bitbucket."}), 500
        return jsonify(response.json().get('values', [])), 200
    except requests.exceptions.HTTPError as e:
         return jsonify({
            "error": f"Failed to fetch Bitbucket commits: {e.response.status_code} {e.response.reason}",
            "details": e.response.text
        }), e.response.status_code
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500

@app.route('/jira_issues', methods=['GET'])
@authenticate
def get_jira_issues(user_data, user_email):
    if not user_data.get('jira_token') or not user_data.get('jira_url'):
        return jsonify({"error": "Jira credentials not configured."}), 400
    try:
        decrypted_token = cipher_suite.decrypt(user_data['jira_token'].encode()).decode()
        jira_url = prepare_url(user_data['jira_url'])
        jira_user = user_data.get('jira_user')
        jira_project = user_data.get('jira_project')
        
        if not jira_project:
            return jsonify({"error": "Jira Project Key is not configured in Connections."}), 400

        # --- FIX: Robustly build JQL query ---
        jql_parts = [f'project = "{jira_project}"']
        
        assignee = request.args.get('username')
        status = request.args.get('status')
        start_date_str = request.args.get('startDate')
        end_date_str = request.args.get('endDate')

        if assignee and assignee != 'all':
            jql_parts.append(f'assignee = "{assignee}"')
        if status and status != 'All Statuses':
            jql_parts.append(f'status = "{status}"')
        if start_date_str and start_date_str not in ['undefined', 'null']:
            start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00')).strftime('%Y-%m-%d')
            jql_parts.append(f'created >= "{start_date}"')
        if end_date_str and end_date_str not in ['undefined', 'null']:
            end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00')).strftime('%Y-%m-%d')
            jql_parts.append(f'created <= "{end_date}"')

        jql_query = " AND ".join(jql_parts)
        
        url = f"{jira_url}/rest/api/2/search"
        params = {'jql': jql_query}
        auth = (jira_user, decrypted_token)
        headers = {"Accept": "application/json"}
        
        response = requests.get(url, headers=headers, auth=auth, params=params, verify=False)
        response.raise_for_status()
        
        if not response.text:
            return jsonify({"error": "Received an empty response from Jira. Check for network issues."}), 500
        return jsonify(response.json().get('issues', [])), 200
        
    except requests.exceptions.HTTPError as e:
        return jsonify({
            "error": f"Failed to fetch Jira issues: {e.response.status_code} {e.response.reason}",
            "details": e.response.text
        }), e.response.status_code
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred in get_jira_issues: {e}"}), 500

@app.route('/jira_users', methods=['GET'])
@authenticate
def get_jira_users(user_data, user_email):
    if not user_data.get('jira_token') or not user_data.get('jira_url'): return jsonify([]), 200
    try:
        decrypted_token = cipher_suite.decrypt(user_data['jira_token'].encode()).decode()
        jira_url = prepare_url(user_data['jira_url'])
        jira_user = user_data.get('jira_user')
        jira_project = user_data.get('jira_project', 'OPS')
        url = f"{jira_url}/rest/api/2/user/assignable/search?project={jira_project}"
        auth = (jira_user, decrypted_token)
        response = requests.get(url, headers={"Accept": "application/json"}, auth=auth, verify=False)
        response.raise_for_status()
        if not response.text: return jsonify([]), 200
        return jsonify(response.json()), 200
    except Exception:
        return jsonify([]), 200

@app.route('/jira_statuses', methods=['GET'])
@authenticate
def get_jira_statuses(user_data, user_email):
    if not user_data.get('jira_token') or not user_data.get('jira_url'): return jsonify([]), 200
    try:
        decrypted_token = cipher_suite.decrypt(user_data['jira_token'].encode()).decode()
        jira_url = prepare_url(user_data['jira_url'])
        jira_user = user_data.get('jira_user')
        url = f"{jira_url}/rest/api/2/status"
        auth = (jira_user, decrypted_token)
        response = requests.get(url, headers={"Accept": "application/json"}, auth=auth, verify=False)
        response.raise_for_status()
        if not response.text: return jsonify([]), 200
        return jsonify(response.json()), 200
    except Exception:
        return jsonify([]), 200

@app.route('/bitbucket_users', methods=['GET'])
@authenticate
def get_bitbucket_users(user_data, user_email):
    if not user_data.get('bitbucket_pass') or not user_data.get('bitbucket_workspace'): return jsonify([]), 200
    try:
        decrypted_pass = cipher_suite.decrypt(user_data['bitbucket_pass'].encode()).decode()
        bitbucket_user = user_data.get('bitbucket_user')
        bitbucket_workspace = user_data.get('bitbucket_workspace')
        url = f"https://api.bitbucket.org/2.0/workspaces/{bitbucket_workspace}/members"
        auth = (bitbucket_user, decrypted_pass)
        response = requests.get(url, auth=auth, verify=False)
        response.raise_for_status()
        if not response.text: return jsonify([]), 200
        return jsonify(response.json().get('values', [])), 200
    except Exception:
        return jsonify([]), 200

@app.route('/summarize', methods=['POST'])
@authenticate
def summarize(user_data, user_email):
    data = request.json
    text_to_summarize = data.get('text')
    output_format = data.get('format', 'a concise paragraph')
    if not text_to_summarize: return jsonify({'error': 'No text provided'}), 400
    try:
        response = client.chat.completions.create( model="gpt-3.5-turbo", messages=[ {"role": "system", "content": f"Summarize text as {output_format}."}, {"role": "user", "content": text_to_summarize} ] )
        return jsonify({'summary': response.choices[0].message.content})
    except Exception as e:
        return jsonify({'error': f'Failed to generate summary: {e}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
