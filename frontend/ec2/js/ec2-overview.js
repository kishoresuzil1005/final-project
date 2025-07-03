// frontend/ec2/js/ec2-overview.js

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:5000/api'; // Make sure this matches your Flask backend URL
    const resourceGrid = document.getElementById('resourceGrid');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessageDiv = document.getElementById('errorMessage');

    // Define the resources and their corresponding detail pages
    // The 'page' paths are relative to the 'ec2/pages/' directory where this HTML file resides.
    const resources = [
        { name: 'Instances', apiPath: 'ec2-instances', page: 'ec2-instances.html', countKey: 'Instances' },
        { name: 'Auto Scaling Groups', apiPath: 'auto-scaling-groups', page: 'ec2-auto-scaling-groups.html', countKey: 'AutoScalingGroups' },
        { name: 'Capacity Reservations', apiPath: 'capacity-reservations', page: 'ec2-capacity-reservations.html', countKey: 'CapacityReservations' },
        { name: 'Dedicated Hosts', apiPath: 'dedicated-hosts', page: 'ec2-dedicated-hosts.html', countKey: 'DedicatedHosts' },
        { name: 'Elastic IPs', apiPath: 'elastic-ips', page: 'ec2-elastic-ips.html', countKey: 'ElasticIPs' },
        { name: 'Key Pairs', apiPath: 'key-pairs', page: 'ec2-key-pairs.html', countKey: 'KeyPairs' },
        { name: 'Load Balancers', apiPath: 'load-balancers', page: 'ec2-load-balancers.html', countKey: 'LoadBalancers' },
        { name: 'Placement Groups', apiPath: 'placement-groups', page: 'ec2-placement-groups.html', countKey: 'PlacementGroups' },
        { name: 'Security Groups', apiPath: 'security-groups', page: 'ec2-security-groups.html', countKey: 'SecurityGroups' },
        { name: 'Snapshots', apiPath: 'snapshots', page: 'ec2-snapshots.html', countKey: 'Snapshots' },
        { name: 'Volumes', apiPath: 'volumes', page: 'ec2-volumes.html', countKey: 'Volumes' },
    ];

    async function fetchEc2Overview() {
        loadingMessage.style.display = 'block';
        errorMessageDiv.style.display = 'none';
        resourceGrid.innerHTML = ''; // Clear existing cards

        try {
            // Using the callApi helper from common.js
            const data = await callApi(`${API_BASE_URL}/ec2-overview`);
            displayOverview(data);
        } catch (error) {
            console.error('Error fetching EC2 overview:', error);
            errorMessageDiv.textContent = `Failed to load EC2 overview: ${error.message}. Please ensure the backend is running and AWS credentials are set.`;
            errorMessageDiv.style.display = 'block';
        } finally {
            loadingMessage.style.display = 'none';
        }
    }

    function displayOverview(counts) {
        resources.forEach(resource => {
            const count = counts[resource.countKey] !== undefined ? counts[resource.countKey] : 'N/A';
            const card = document.createElement('a'); // Using <a> tag to make the entire card clickable
            card.href = resource.page; // Link to the specific detail page
            card.className = 'resource-card';
            card.innerHTML = `
                <h3>${resource.name}</h3>
                <div class="count">${count}</div>
                <p>View details</p>
            `;
            resourceGrid.appendChild(card);
        });
    }

    // Initial fetch when the page loads
    fetchEc2Overview();
});
