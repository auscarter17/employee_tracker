INSERT INTO departments (name)
VALUES
    ('Engineering'),
    ('Finance'),
    ('Legal'),
    ('Sales');

INSERT INTO roles (title, salary, department_id)
VALUES  
    ('Sales Lead', 100000, 4),
    ('Salesperson', 80000, 4),
    ('Lead Engineer', 150000, 1),
    ('Software Engineer', 120000, 1),
    ('Account Manager', 160000, 2),
    ('Accountant', 125000, 2),
    ('Legal Team Lead', 250000, 3),
    ('Lawyer', 190000, 3);

 INSERT INTO employees (first_name, last_name, role_id, manager_id)
 VALUES 
    ('Harry', 'Harrington', 1, null),
    ('Charles', 'Charlington', 2, 1),
    ('Tom', 'Tommerton', 3, null),
    ('Betty', 'Bettington', 4, 3),
    ('Chelsea', 'Chelsinger', 5, null),
    ('Sheapard', 'Sheapardton', 6, 5),
    ('Jerry', 'Jerrington', 7, null),
    ('Jimmy', 'Jimmson', 8, 7);