// frontend/ec2/js/ec2-instances.js

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:5000/api'; // Make sure this matches your Flask backend URL
    const tableBody = document.querySelector('#ec2InstancesTable tbody');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessageDiv = document.getElementById('errorMessage');
    const refreshButton = document.getElementById('refreshButton');

    async function fetchEc2Instances() {
        loadingMessage.style.display = 'block';
        errorMessageDiv.style.display = 'none';
        tableBody.innerHTML = ''; // Clear existing rows

        try {
            // Using the callApi helper from common.js
            const instances = await callApi(`${API_BASE_URL}/ec2-instances`);
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
            // Format launch time nicely
            row.insertCell().textContent = instance.LaunchTime ? new Date(instance.LaunchTime).toLocaleString() : 'N/A';

            const actionsCell = row.insertCell();

            // Start Button
            const startBtn = document.createElement('button');
            startBtn.textContent = 'Start';
            startBtn.className = 'action-button start';
            startBtn.disabled = !(instance.State === 'stopped'); // Enable only if stopped
            startBtn.onclick = () => handleInstanceAction('start', instance.InstanceId);
            actionsCell.appendChild(startBtn);

            // Stop Button
            const stopBtn = document.createElement('button');
            stopBtn.textContent = 'Stop';
            stopBtn.className = 'action-button stop';
            stopBtn.disabled = !(instance.State === 'running'); // Enable only if running
            stopBtn.onclick = () => handleInstanceAction('stop', instance.InstanceId);
            actionsCell.appendChild(stopBtn);

            // Terminate Button
            const terminateBtn = document.createElement('button');
            terminateBtn.textContent = 'Terminate';
            terminateBtn.className = 'action-button terminate';
            // Disable if already terminated or shutting down (cannot be re-terminated)
            terminateBtn.disabled = (instance.State === 'terminated' || instance.State === 'shutting-down');
            terminateBtn.onclick = () => handleInstanceAction('terminate', instance.InstanceId);
            actionsCell.appendChild(terminateBtn);
        });
    }

    async function handleInstanceAction(action, instanceId) {
        let confirmMessage = '';
        if (action === 'start') {
            confirmMessage = `Are you sure you want to START instance ${instanceId}?`;
        } else if (action === 'stop') {
            confirmMessage = `Are you sure you want to STOP instance ${instanceId}?`;
        } else if (action === 'terminate') {
            confirmMessage = `WARNING: Are you absolutely sure you want to TERMINATE instance ${instanceId}? This action is irreversible!`;
        }

        // Using showConfirm helper from common.js
        const confirmed = await showConfirm(confirmMessage);
        if (confirmed) {
            try {
                // Using callApi helper from common.js
                const data = await callApi(`${API_BASE_URL}/ec2-instance/${instanceId}/${action}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                showMessage(data.message); // Using showMessage helper from common.js
                fetchEc2Instances(); // Refresh the list after action
            } catch (error) {
                showMessage(`Error: ${error.message}`); // Using showMessage helper from common.js
            }
        }
    }

    // Initial fetch when the page loads
    fetchEc2Instances();

    // Add event listener for the refresh button
    refreshButton.addEventListener('click', fetchEc2Instances);
});
