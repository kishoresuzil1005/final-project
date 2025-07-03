document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:5000/api'; // Make sure this matches your Flask backend
    const tableBody = document.querySelector('#ec2InstancesTable tbody');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessageDiv = document.getElementById('errorMessage');
    const refreshButton = document.getElementById('refreshButton');

    async function fetchEc2Instances() {
        loadingMessage.style.display = 'block';
        errorMessageDiv.style.display = 'none';
        tableBody.innerHTML = ''; // Clear existing rows

        try {
            const response = await fetch(`${API_BASE_URL}/ec2-instances`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const instances = await response.json();
            displayEc2Instances(instances);
        } catch (error) {
            console.error('Error fetching EC2 instances:', error);
            errorMessageDiv.textContent = `Failed to load EC2 instances: ${error.message}. Please ensure the backend is running and AWS credentials are set.`;
            errorMessageDiv.style.display = 'block';
        } finally {
            loadingMessage.style.display = 'none';
        }
    }

    function displayEc2Instances(instances) {
        if (instances.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8">No EC2 instances found in this region.</td></tr>';
            return;
        }

        instances.forEach(instance => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = instance.Name;
            row.insertCell().textContent = instance.InstanceId;
            row.insertCell().textContent = instance.State;
            row.insertCell().textContent = instance.InstanceType;
            row.insertCell().textContent = instance.PublicIpAddress;
            row.insertCell().textContent = instance.PrivateIpAddress;
            row.insertCell().textContent = instance.LaunchTime ? new Date(instance.LaunchTime).toLocaleString() : 'N/A'; // Format date

            const actionsCell = row.insertCell();

            const startBtn = document.createElement('button');
            startBtn.textContent = 'Start';
            startBtn.className = 'action-button start';
            startBtn.disabled = !(instance.State === 'stopped'); // Enable only if stopped
            startBtn.onclick = () => confirmAction('start', instance.InstanceId);
            actionsCell.appendChild(startBtn);

            const stopBtn = document.createElement('button');
            stopBtn.textContent = 'Stop';
            stopBtn.className = 'action-button stop';
            stopBtn.disabled = !(instance.State === 'running'); // Enable only if running
            stopBtn.onclick = () => confirmAction('stop', instance.InstanceId);
            actionsCell.appendChild(stopBtn);

            const terminateBtn = document.createElement('button');
            terminateBtn.textContent = 'Terminate';
            terminateBtn.className = 'action-button terminate';
            terminateBtn.disabled = (instance.State === 'terminated' || instance.State === 'shutting-down'); // Disable if already terminating/terminated
            terminateBtn.onclick = () => confirmAction('terminate', instance.InstanceId);
            actionsCell.appendChild(terminateBtn);
        });
    }

    async function confirmAction(action, instanceId) {
        let confirmMessage = '';
        if (action === 'start') {
            confirmMessage = `Are you sure you want to START instance ${instanceId}?`;
        } else if (action === 'stop') {
            confirmMessage = `Are you sure you want to STOP instance ${instanceId}?`;
        } else if (action === 'terminate') {
            confirmMessage = `WARNING: Are you absolutely sure you want to TERMINATE instance ${instanceId}? This action is irreversible!`;
        }

        if (confirm(confirmMessage)) {
            await performInstanceAction(action, instanceId);
        }
    }

    async function performInstanceAction(action, instanceId) {
        try {
            const response = await fetch(`${API_BASE_URL}/ec2-instance/${instanceId}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || `Failed to ${action} instance ${instanceId}`);
            }

            alert(data.message);
            fetchEc2Instances(); // Refresh the list after action
        } catch (error) {
            console.error(`Error performing ${action} on instance ${instanceId}:`, error);
            alert(`Error: ${error.message}`);
        }
    }

    // Initial fetch when the page loads
    fetchEc2Instances();

    // Add event listener for the refresh button
    refreshButton.addEventListener('click', fetchEc2Instances);
});
