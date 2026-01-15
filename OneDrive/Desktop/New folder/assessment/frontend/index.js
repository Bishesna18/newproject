// API Base URL
//const API_URL = "/api/employee";
const API_URL = "http://localhost:8000/api/employee";

// Global variables
let employees = [];
let selectedEmployee = null;

// DOM Elements
const addBtn = document.querySelector(".createEmployee");
const editBtn = document.querySelector(".editEmployee");
const addModal = document.querySelector(".addEmployee");
const editModal = document.querySelector(".editEmployee_div");
const addEmployeeForm = document.querySelector(".addEmployee_create");
const editEmployeeForm = document.querySelector(".editEmployee_Edit");
const employeesList = document.querySelector(".employees__names--list");
const employeeInfo = document.querySelector(".employees__single--info");

// Fetch all employees from API
async function fetchEmployees() {
    try {
        const response = await fetch(API_URL);
        employees = await response.json();
        renderEmployees();
    } catch (error) {
        console.error("Error fetching employees:", error);
        alert("Failed to load employees");
    }
}

// Render employee list
function renderEmployees() {
    employeesList.innerHTML = "";
    
    employees.forEach((emp) => {
        const div = document.createElement("div");
        div.className = "employees__names--item";
        div.innerHTML = `
            <span>${emp.firstName} ${emp.lastName}</span>
            <button onclick="deleteEmployee(${emp.id})" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Delete</button>
        `;
        
        div.addEventListener("click", (e) => {
            if (e.target.tagName !== 'BUTTON') {
                displayEmployee(emp.id);
            }
        });
        
        employeesList.appendChild(div);
    });
}

// Display single employee details
function displayEmployee(id) {
    selectedEmployee = employees.find(emp => emp.id === id);
    
    if (!selectedEmployee) return;
    
    // Remove previous selection
    document.querySelectorAll(".employees__names--item").forEach(item => {
        item.classList.remove("selected");
    });
    
    // Add selection to current item
    event.currentTarget?.classList.add("selected");
    
    employeeInfo.innerHTML = `
        <div class="employees__single--heading">${selectedEmployee.firstName} ${selectedEmployee.lastName}</div>
        <img src="${selectedEmployee.imageUrl || 'https://via.placeholder.com/220'}" alt="Employee Photo" />
        <p><strong>Email:</strong> ${selectedEmployee.email}</p>
        <p><strong>Contact:</strong> ${selectedEmployee.contactNumber}</p>
        <p><strong>Salary:</strong> $${selectedEmployee.salary}</p>
        <p><strong>Address:</strong> ${selectedEmployee.address}</p>
        <p><strong>DOB:</strong> ${selectedEmployee.dob}</p>
        <p><strong>Age:</strong> ${selectedEmployee.age || 'N/A'}</p>
    `;
}

// Add new employee
addEmployeeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = new FormData(addEmployeeForm);
    const empData = {};
    
    formData.forEach((value, key) => {
        empData[key] = value;
    });
    
    // Calculate age from DOB
    empData.age = new Date().getFullYear() - parseInt(empData.dob.slice(0, 4), 10);
    
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(empData)
        });
        
        if (response.ok) {
            alert("Employee added successfully!");
            addEmployeeForm.reset();
            addModal.classList.remove("active");
            fetchEmployees(); // Reload employee list
        } else {
            alert("Failed to add employee");
        }
    } catch (error) {
        console.error("Error adding employee:", error);
        alert("Error adding employee");
    }
});

// Edit employee
editEmployeeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    if (!selectedEmployee) {
        alert("Please select an employee to edit");
        return;
    }
    
    const formData = new FormData(editEmployeeForm);
    const updates = {};
    
    formData.forEach((value, key) => {
        updates[key] = value;
    });
    
    // Calculate age from DOB
    updates.age = new Date().getFullYear() - parseInt(updates.dob.slice(0, 4), 10);
    
    try {
        const response = await fetch(`${API_URL}/${selectedEmployee.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updates)
        });
        
        if (response.ok) {
            alert("Employee updated successfully!");
            editEmployeeForm.reset();
            editModal.classList.remove("active");
            fetchEmployees(); // Reload employee list
        } else {
            alert("Failed to update employee");
        }
    } catch (error) {
        console.error("Error updating employee:", error);
        alert("Error updating employee");
    }
});

// Delete employee
async function deleteEmployee(id) {
    if (!confirm("Are you sure you want to delete this employee?")) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });
        
        if (response.ok) {
            alert("Employee deleted successfully!");
            selectedEmployee = null;
            employeeInfo.innerHTML = "";
            fetchEmployees(); // Reload employee list
        } else {
            alert("Failed to delete employee");
        }
    } catch (error) {
        console.error("Error deleting employee:", error);
        alert("Error deleting employee");
    }
}

// Open Add Employee modal
addBtn.addEventListener("click", () => {
    addModal.classList.add("active");
});

// Open Edit Employee modal
editBtn.addEventListener("click", () => {
    if (!selectedEmployee) {
        alert("Please select an employee to edit");
        return;
    }
    
    // Pre-fill form with selected employee data
    editEmployeeForm.firstName.value = selectedEmployee.firstName;
    editEmployeeForm.lastName.value = selectedEmployee.lastName;
    editEmployeeForm.imageUrl.value = selectedEmployee.imageUrl || "";
    editEmployeeForm.email.value = selectedEmployee.email;
    editEmployeeForm.contactNumber.value = selectedEmployee.contactNumber;
    editEmployeeForm.salary.value = selectedEmployee.salary;
    editEmployeeForm.address.value = selectedEmployee.address;
    editEmployeeForm.dob.value = selectedEmployee.dob;
    
    editModal.classList.add("active");
});

// Close modals when clicking outside
window.addEventListener("click", (e) => {
    if (e.target === addModal) {
        addModal.classList.remove("active");
    }
    if (e.target === editModal) {
        editModal.classList.remove("active");
    }
});

// Initialize - Load employees on page load
fetchEmployees();