var inquirer = require("inquirer")
var mysql = require("mysql");
var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '********',
    database: 'bamazon'
});

connection.connect()
connection.query('SELECT * from products', function (error, results, fields) {
    if (error) throw error;
    console.table(results);
});
connection.end()