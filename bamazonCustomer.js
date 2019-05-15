var inquirer = require("inquirer")
var mysql = require("mysql");
var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'alphaCoder90',
    database: 'bamazon'
});

connection.connect(function(err) {
    if (err) throw err;
    
  });
  
  function start(){
    connection.query('SELECT * from products', function (error, results, fields) {
        if (error) throw error;
        console.log("Current inventory:")
        console.table(results);
    

    inquirer
        .prompt({
            name: "itemID",
            type: "input",
            message: "What is the ID of the item you would like?"
        })
  })};
  start();
// connection.query('SELECT * from products', function (error, results, fields) {
//     if (error) throw error;
//     console.table(results);
// });
connection.end()