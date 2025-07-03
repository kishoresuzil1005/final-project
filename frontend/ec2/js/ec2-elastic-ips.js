// frontend/ec2/js/ec2-elastic-ips.js

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:5000/api'; // Make sure this matches your Flask backend URL
    const tableBody = document.querySelector('#elasticIpsTable tbody');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessageDiv = document.getElementById('errorMessage');
    const refreshButton = document.getElementById('refreshButton');

    async function fetchElasticIPs() {
        loadingMessage.style.display = 'block';
        errorMessageDiv.style.display = 'none';
        tableBody.innerHTML = ''; // Clear existing rows

        try {
            // Using the callApi helper from common.js
            const ips = await callApi(`${API_BASE_URL}/elastic-ips`);
            displayElasticIPs(ips);
        } catch (error) {
            console.error('Error fetching Elastic IPs:', error);
            errorMessageDiv.textContent = `Failed to load Elastic IPs: ${error.message}. Please ensure the backend is running and AWS credentials are set.`;
            errorMessageDiv.style.display = 'block';
        } finally {
            loadingMessage.style.display = 'none';
        }
    }

    function displayElasticIPs(ips) {
        if (ips.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">No Elastic IP addresses found in this region.</td></tr>';
            return;
        }

        ips.forEach(ip => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = ip.PublicIp || 'N/A';
            row.insertCell().textContent = ip.AllocationId || 'N/A';
            row.insertCell().textContent = ip.InstanceId || 'Not Associated'; // If not associated, InstanceId will be missing
            row.insertCell().textContent = ip.PrivateIpAddress || 'N/A';
            row.insertCell().textContent = ip.Domain || 'N/A'; // 'vpc' or 'standard'
            row.insertCell().textContent = ip.AssociationId || 'Not Associated'; // If not associated, AssociationId will be missing
            // You can add action buttons here if you want to allow disassociate/release IPs,
            // which would require new backend API endpoints.
        });
    }

    // Initial fetch when the page loads
    fetchElasticIPs();

    // Add event listener for the refresh button
    refreshButton.addEventListener('click', fetchElasticIPs);
});
