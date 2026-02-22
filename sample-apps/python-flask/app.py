from flask import Flask, jsonify
import os
import socket

app = Flask(__name__)

@app.route('/')
def home():
    hostname = socket.gethostname()
    environment = os.environ.get('ENVIRONMENT', 'development')
    return f'''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Flask Docker App</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }}
            .container {{
                text-align: center;
                padding: 40px;
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
                backdrop-filter: blur(10px);
            }}
            h1 {{ margin-bottom: 20px; }}
            .info {{ margin: 10px 0; opacity: 0.9; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🐍 Python Flask App</h1>
            <p class="info">Hostname: {hostname}</p>
            <p class="info">Environment: {environment}</p>
            <p class="info">Running in Docker! 🐳</p>
        </div>
    </body>
    </html>
    '''

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'hostname': socket.gethostname()
    })

@app.route('/api/info')
def info():
    return jsonify({
        'application': 'Python Flask Sample',
        'version': '1.0.0',
        'hostname': socket.gethostname(),
        'environment': os.environ.get('ENVIRONMENT', 'development'),
        'python_version': os.popen('python --version').read().strip()
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
