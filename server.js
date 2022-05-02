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



viewAllDepartments = () => {
  const sql = `SELECT * FROM departments`; 

  db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    userPrompt();
  });
};

viewAllRoles = () => {
  const sql = `SELECT 
                roles.title,
                roles.id,
                departments.name AS departments,
                roles.salary
              FROM roles
                LEFT JOIN departments
                ON roles.department_id = departments.id`;
  db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    userPrompt();
  });
};

viewAllEmployees = () => {
  const sql = `SELECT 
                employees.id, 
                employees.first_name, 
                employees.last_name,
                roles.title, 
                departments.name AS departments, 
                roles.salary, 
                CONCAT (manager.first_name, ' ' , manager.last_name) AS manager
              FROM employees
                LEFT JOIN roles
                ON employees.role_id = roles.id
                LEFT JOIN departments
                ON roles.department_id = departments.id
                LEFT JOIN employees manager ON employees.manager_id = manager.id`;

  db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    userPrompt();
  });
};

addADepartment = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'newDept',
      message: `What's the name of the new Department?`,
      validate: newDept => {
        if (newDept) {
          return true;
        } else {
          console.log('Please enter a name for the Department.');
          return false;
        }
      }
    }
  ])
    .then(answer => {
      const sql = `INSERT INTO departments (name)
                  VALUES (?)`;
      db.query(sql, answer.newDept, (err, result) => {
        if (err) throw err;
        console.log('Department added.');
        userPrompt();
      });
    });
};

addARole = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'newRole',
      message: 'What is the name of the Role?',
      validate: newRole => {
        if (newRole) {
          return true;
        } else {
          console.log('Please enter a name for the role.');
          return false;
        }
      }
    },
    {
      type: 'input',
      name: 'salary',
      message: 'What is the salary for this role?',
      validate: salary => {
        if (isNaN(salary)) {
          console.log('Please enter a number with no other symbols/characters.');
          return false;
        } else {
          return true;
        }
      }
    }
  ])
    .then(answer => {
      const params = [answer.newRole, answer.salary];

      const roleSql = `SELECT name, id FROM departments`;

      db.query(roleSql, (err, data) => {
        if (err) throw err;

        const dept = data.map(({ name, id }) => ({ name: name, value: id }));

        inquirer.prompt([
          {
            type: 'list',
            name: 'dept',
            message: "What department is the new role a part of?",
            choices: dept
          }
        ])
          .then(deptChoice => {
            const dept = deptChoice.dept;
            params.push(dept);

            const sql = `INSERT INTO roles (title, salary, department_id)
                        VALUES (?,?,?)`;

            db.query(sql, params, (err, result) => {
              if (err) throw err;
              console.log('New role added.');
              userPrompt();
            })
          })
      })
    })
}

addAnEmployee = () => {
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

updateAnEmployeeRole = () => {
  
}