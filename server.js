const express = require('express');
const db = require('./db/connection');
const apiRoutes = require('./routes/apiRoutes');
const inquirer = require('inquirer');
const cTable = require('console.table');


const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Use apiRoutes
app.use('/api', apiRoutes);

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

// Start server after DB connection
db.connect(err => {
  if (err) throw err;
  console.log('Database connected.');
  app.listen(PORT, () => {
    console.log(`====================`);
    console.log(`==EMPLOYEE TRACKER==`)
    console.log(`====================`)
    userPrompt();
  });
});

// Prompts to view/modify tables
const userPrompt = () => {
  inquirer.prompt([
      {
        name: 'choices',
        type: 'list',
        message: 'Please select an option:',
        choices: [
          'View All Departments',
          'View All Roles',
          'View All Employees',
          'Add A Department',
          'Add A Role',
          'Add An Employee',
          'Update An Employee Role'
          ]
      }
    ])
    .then((answers) => {
      // user choices lead to functions for each selection
      const {choices} = answers;

        if (choices === 'View All Departments') {
            viewAllDepartments();
        }

        if (choices === 'View All Roles') {
            viewAllRoles();
        }

        if (choices === 'View All Employees') {
          viewAllEmployees();
        }

        if (choices === 'Add A Department') {
          addADepartment();
        }

        if (choices === 'Add A Role') {
          addARole();
        }

        if (choices === 'Add An Employee') {
          addAnEmployee();
        }

        if (choices === 'Update An Employee Role') {
          updateAnEmployeeRole();
        }
  });
};

viewAllDepartments = () => {
  const sql = `SELECT * FROM departments`; 

  db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    userPrompt();
  });
};

viewAllRoles = () => {
  const sql = `SELECT * FROM roles`;

  db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    userPrompt();
  });
};

viewAllEmployees = () => {
  const sql = `SELECT * FROM employees`;

  db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    userPrompt();
  });
};