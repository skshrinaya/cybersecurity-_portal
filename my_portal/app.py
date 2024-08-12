from flask import Flask, jsonify, render_template, request
import psutil
import subprocess
import logging

app = Flask(__name__)

def get_servers():
    servers = []
    for proc in psutil.process_iter(['pid', 'name', 'status']):
        servers.append({
            'id': proc.info['pid'],
            'name': proc.info['name'],
            'status': proc.info['status']
        })
    return servers

def get_firewalls():
    try:
        result = subprocess.check_output("netsh advfirewall firewall show rule name=all", shell=True, text=True)
        rules = result.splitlines()
        return {'rules': rules}
    except subprocess.CalledProcessError as e:
        return {'error': f"Command failed with error: {e.output}"}
    except Exception as e:
        return {'error': f"Unexpected error: {str(e)}"}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/servers', methods=['GET'])
def servers():
    return jsonify(get_servers())

@app.route('/api/firewalls', methods=['GET'])
def firewalls():
    return jsonify(get_firewalls())

@app.route('/api/filter_firewalls', methods=['POST'])
def filter_firewalls():
    filter_term = request.json.get('filter_term', '')
    firewall_data = get_firewalls()
    if 'rules' in firewall_data:
        filtered_rules = [rule for rule in firewall_data['rules'] if filter_term.lower() in rule.lower()]
        return jsonify({'rules': filtered_rules})
    return jsonify(firewall_data)

@app.route('/api/export_data', methods=['GET'])
def export_data():
    import csv
    from io import StringIO

    output = StringIO()
    writer = csv.writer(output)
    
    
    servers = get_servers()
    writer.writerow(['ID', 'Name', 'Status'])
    for server in servers:
        writer.writerow([server['id'], server['name'], server['status']])

    
    firewalls = get_firewalls()
    if 'rules' in firewalls:
        writer.writerow([])
        writer.writerow(['Firewall Rules'])
        for rule in firewalls['rules']:
            writer.writerow([rule])

    output.seek(0)
    response = app.response_class(
        response=output.getvalue(),
        mimetype='text/csv',
        headers={"Content-Disposition": "attachment;filename=data_export.csv"}
    )
    return response

if __name__ == '__main__':
    app.run(debug=True)
