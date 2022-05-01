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
  inquirer.prompt([
    {
      type: 'input',
      name: 'employeeFirstName',
      message: `Enter employee's first name:`
    },
    {
      type: 'input',
      name: 'employeeLastName',
      message: `Please enter employee's last name:`
    },
    {
      type: 'list',
      name: 'role',
      message: 'Select Employee Role:',
      choices: allRoles
    }
  ])
     // determine which role the employee will have
     .then(data => {
      let index = allRoles.findIndex(element => {
         if (element === data.role) {
            return true;
         }
      })
      index += 1;

      const sql = `INSERT INTO employees (first_name, last_name, role_id) VALUES (?,?,?)`;
      const params = [data.employeeFirstName, data.employeeLastName, index];

      db.query(sql, params, (err, result) => {
         if (err) throw err;
      })
      console.log("New employee successfully added.");
   })
   .then(() => {
      userPrompt();
   })
};