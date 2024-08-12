document.addEventListener('DOMContentLoaded', () => {
    const fetchServersButton = document.getElementById('fetchServers');
    const fetchFirewallsButton = document.getElementById('fetchFirewalls');
    const serverListDiv = document.getElementById('serverList');
    const firewallListDiv = document.getElementById('firewallList');
    const notificationDiv = document.getElementById('notification');
    const exportServersButton = document.getElementById('exportServers');
    const exportFirewallsButton = document.getElementById('exportFirewalls');
    const searchServersInput = document.getElementById('searchServers');
    const searchFirewallsInput = document.getElementById('searchFirewalls');

    function showNotification(message, isError = false) {
        notificationDiv.textContent = message;
        notificationDiv.style.display = 'block';
        notificationDiv.className = `notification ${isError ? 'notification-error' : 'notification-success'}`;
        setTimeout(() => {
            notificationDiv.style.display = 'none';
        }, 5000);
    }

    fetchServersButton.addEventListener('click', () => {
        fetch('/api/servers')
            .then(response => response.json())
            .then(data => {
                serverListDiv.innerHTML = `
                    <h3>Server Data:</h3>
                    <table id="serversTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="serversTableBody"></tbody>
                    </table>
                `;
                const tbody = document.getElementById('serversTableBody');
                if (Array.isArray(data)) {
                    data.forEach(server => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${server.id}</td>
                            <td>${server.name}</td>
                            <td>${server.status}</td>
                        `;
                        tbody.appendChild(row);
                    });
                    showNotification('Servers data fetched successfully.');
                } else {
                    serverListDiv.innerHTML += '<p>Error: Unexpected data format.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching servers:', error);
                serverListDiv.innerHTML = '<p>Error fetching server data.</p>';
                showNotification('Error fetching server data.', true);
            });
    });

    fetchFirewallsButton.addEventListener('click', () => {
        fetch('/api/firewalls')
            .then(response => response.json())
            .then(data => {
                firewallListDiv.innerHTML = `
                    <h3>Firewall Status:</h3>
                    <table id="firewallsTable">
                        <thead>
                            <tr>
                                <th>Rule</th>
                            </tr>
                        </thead>
                        <tbody id="firewallsTableBody"></tbody>
                    </table>
                `;
                const tbody = document.getElementById('firewallsTableBody');
                if (Array.isArray(data.rules)) {
                    data.rules.forEach(rule => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${rule}</td>
                        `;
                        tbody.appendChild(row);
                    });
                    showNotification('Firewall data fetched successfully.');
                } else {
                    firewallListDiv.innerHTML += '<p>Error: ' + (data.error || 'Unexpected data format.') + '</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching firewalls:', error);
                firewallListDiv.innerHTML = '<p>Error fetching firewall data.</p>';
                showNotification('Error fetching firewall data.', true);
            });
    });

    exportServersButton.addEventListener('click', () => {
        fetch('/api/servers')
            .then(response => response.json())
            .then(data => {
                let csvContent = "data:text/csv;charset=utf-8,";
                csvContent += "ID,Name,Status\n";
                data.forEach(server => {
                    csvContent += `${server.id},${server.name},${server.status}\n`;
                });
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement('a');
                link.setAttribute('href', encodedUri);
                link.setAttribute('download', 'servers.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showNotification('Server data exported successfully.');
            })
            .catch(error => {
                console.error('Error exporting servers:', error);
                showNotification('Error exporting server data.', true);
            });
    });

    exportFirewallsButton.addEventListener('click', () => {
        fetch('/api/firewalls')
            .then(response => response.json())
            .then(data => {
                let csvContent = "data:text/csv;charset=utf-8,";
                csvContent += "Rule\n";
                if (Array.isArray(data.rules)) {
                    data.rules.forEach(rule => {
                        csvContent += `${rule}\n`;
                    });
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', 'firewalls.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showNotification('Firewall data exported successfully.');
                } else {
                    showNotification('Error exporting firewall data.', true);
                }
            })
            .catch(error => {
                console.error('Error exporting firewalls:', error);
                showNotification('Error exporting firewall data.', true);
            });
    });

    searchServersInput.addEventListener('input', () => {
        const searchTerm = searchServersInput.value.toLowerCase();
        const rows = document.querySelectorAll('#serversTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? 'table-row' : 'none';
        });
    });

    searchFirewallsInput.addEventListener('input', () => {
        const searchTerm = searchFirewallsInput.value.toLowerCase();
        const rows = document.querySelectorAll('#firewallsTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? 'table-row' : 'none';
        });
    });
});
