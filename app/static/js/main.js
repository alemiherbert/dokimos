
function openTab(button, tabID) {
    w3.removeClass('.menu>button', 'active');
    button.classList.add('active');

    w3.addStyle('.tab', 'display', 'none');
    w3.addStyle(`#${tabID}`, 'display', 'flex');
    document.getElementById('tab-title').textContent = tabID;
}
w3.addStyle('#overview', 'display', 'flex');


function populateTable(data) {
    const tableBody = document.getElementById('userTableBody');
    tableBody.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement('tr');

        // Populate each cell in the row
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.firstname} ${item.lastname}</td>
            <td>${item.email}</td>
            <td>${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</td>
            <td>${new Date(item.date_joined).toLocaleDateString()}</td>
            <td class="crud-buttons">
                <button class="small info" onclick="editRow(${item.id})">Edit</button>
                <button class="small danger" onclick="deleteRow(${item.id})">Delete</button>
            </td>
        `;

        tableBody.appendChild(row); // Append row to table body
    });
}


// Fill the table!
fetch('/api/users')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        populateTable(data.items);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });