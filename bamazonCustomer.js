var inquirer = require("inquirer")
var mysql = require("mysql");
var itemID;
var itemQuantity;
var productName;
var productInventory;
var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '***',
    database: 'bamazon'
});

connection.connect(function (err) {
    if (err) throw err;

});

function start() {
    connection.query('SELECT * from products', function (error, results, fields) {
        if (error) throw error;
        console.log("Current inventory:")
        console.table(results);


        inquirer
            .prompt([{
                // Ask what they want
                name: "itemID",
                type: "input",
                message: "What is the ID of the item you would like?"
            },
            {
                // Ask how many they want
                name: "amount",
                type: "input",
                message: "How many units would you like to buy?"
            }])
            .then(function (answer) {
                // console.log(answer.itemID);
                itemID = answer.itemID;
                itemQuantity = answer.amount;
                connection.query('SELECT * FROM products WHERE ?',
                    {
                        id: itemID
                    },
                    function (error, results) {
                        if (error) throw error;
                        productName = results[0].product_name;
                        productInventory = results[0].inventory;
                        if (itemQuantity > productInventory) {
                            console.log("NOT ENOUGH INVENTORY TO MEET YOUR NEEDS!")
                        } else {
                            console.log("You would like to by " + itemQuantity + " of " + productName)
                        }
                    })
                connection.end()
            })

    })
};
start();
// connection.query('SELECT * from products', function (error, results, fields) {
//     if (error) throw error;
//     console.table(results);
// });
