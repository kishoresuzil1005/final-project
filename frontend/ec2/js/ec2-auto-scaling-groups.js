// frontend/ec2/js/ec2-auto-scaling-groups.js

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:5000/api'; // Make sure this matches your Flask backend URL
    const tableBody = document.querySelector('#autoScalingGroupsTable tbody');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessageDiv = document.getElementById('errorMessage');
    const refreshButton = document.getElementById('refreshButton');

    async function fetchAutoScalingGroups() {
        loadingMessage.style.display = 'block';
        errorMessageDiv.style.display = 'none';
        tableBody.innerHTML = ''; // Clear existing rows

        try {
            // Using the callApi helper from common.js
            const asgs = await callApi(`${API_BASE_URL}/auto-scaling-groups`);
            displayAutoScalingGroups(asgs);
        } catch (error) {
            console.error('Error fetching Auto Scaling Groups:', error);
            errorMessageDiv.textContent = `Failed to load Auto Scaling Groups: ${error.message}. Please ensure the backend is running and AWS credentials are set.`;
            errorMessageDiv.style.display = 'block';
        } finally {
            loadingMessage.style.display = 'none';
        }
    }

    function displayAutoScalingGroups(asgs) {
        if (asgs.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7">No Auto Scaling Groups found in this region.</td></tr>';
            return;
        }

        asgs.forEach(asg => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = asg.AutoScalingGroupName || 'N/A';
            row.insertCell().textContent = asg.MinSize !== undefined ? asg.MinSize : 'N/A';
            row.insertCell().textContent = asg.MaxSize !== undefined ? asg.MaxSize : 'N/A';
            row.insertCell().textContent = asg.DesiredCapacity !== undefined ? asg.DesiredCapacity : 'N/A';

            // Display Launch Configuration Name or Launch Template Name/ID
            let launchConfigOrTemplate = 'N/A';
            if (asg.LaunchConfigurationName) {
                launchConfigOrTemplate = `LC: ${asg.LaunchConfigurationName}`;
            } else if (asg.LaunchTemplate) {
                launchConfigOrTemplate = `LT: ${asg.LaunchTemplate.LaunchTemplateName || asg.LaunchTemplate.LaunchTemplateId}`;
                if (asg.LaunchTemplate.Version) {
                    launchConfigOrTemplate += ` (v${asg.LaunchTemplate.Version})`;
                }
            }
            row.insertCell().textContent = launchConfigOrTemplate;

            // List associated instances
            const instancesCell = row.insertCell();
            if (asg.Instances && asg.Instances.length > 0) {
                const instanceIds = asg.Instances.map(inst => `${inst.InstanceId} (${inst.LifecycleState})`).join('<br>');
                instancesCell.innerHTML = instanceIds;
            } else {
                instancesCell.textContent = 'None';
            }

            // Format Created Time nicely
            row.insertCell().textContent = asg.CreatedTime ? new Date(asg.CreatedTime).toLocaleString() : 'N/A';
            // You can add action buttons here if you want to modify ASG properties (update desired capacity, suspend/resume processes, etc.)
            // which would require new backend API endpoints.
        });
    }

    // Initial fetch when the page loads
    fetchAutoScalingGroups();

    // Add event listener for the refresh button
    refreshButton.addEventListener('click', fetchAutoScalingGroups);
});
