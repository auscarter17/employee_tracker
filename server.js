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

let allRoles = [];
let allManagers = [];

// Prompts to view/modify tables
const userPrompt = async () => {
  return inquirer.prompt([
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

const getRoles = async () => {
  const sql = `SELECT title FROM roles`;

  db.query(sql, (err, rows) => {
     if (err) throw err;
     rows.forEach(element => {
        allRoles.push(element.title);
     })
  })
}

const getManagers = async () => {
  const sql = `SELECT * FROM employees WHERE manager_id IS NULL`;

  db.query(sql, (err, rows) => {
    if (err) throw err;
    rows.forEach(element => {
      allManagers.push(element.first_name);
    })
  })
}

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

addADepartment = () => {
  
}

addAnEmployee = () => {
  getRoles();
  getManagers();
  inquirer.prompt([
    {
      type: 'input',
      name: 'employeeFirstName',
      message: `Enter employee's first name:`,
      validate: addFirstName => {
        if (addFirstName) {
          return true;
        } else {
          console.log('Please enter a first name.');
          return false;
        }
      }
    },
    {
      type: 'input',
      name: 'employeeLastName',
      message: `Please enter employee's last name:`,
      validate: addLastName => {
        if (addLastName) {
          return true;
        } else {
          console.log('Please enter a last name.');
          return false;
        }
      }
    }
  ])
    .then(answer => {
      const employeeData = [answer.employeeFirstName, answer.employeeLastName]
      const roleSql = `SELECT roles.id, roles.title FROM roles`;
      db.query(roleSql, (error, data) => {
        if (error) throw error;
        const roles = data.map(({ id, title }) => ({ name: title, value: id}));
        inquirer.prompt([
          {
            type: 'list',
            name: 'role',
            message: "What is this employee's role?",
            choices: roles
          }
        ])
          .then(roleChoice => {
            const role = roleChoice.role;
            employeeData.push(role);
            const managerSql = `SELECT * FROM employees`;
            db.query(managerSql, (error, data) => {
              if (error) throw error;
              const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id}));
              inquirer.prompt([
                {
                  type: 'list',
                  name: 'manager',
                  message: "Who is this employee's manager?",
                  choices: managers
                }
              ])
                .then(managerChoice => {
                  const manager = managerChoice.manager;
                  employeeData.push(manager);
                  const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`;
                  db.query(sql, employeeData, (error) => {
                    if (error) throw error;
                    console.log("Employee has been added.")
                    userPrompt();
                  });
                });
            });
          });
      });
    });
};;