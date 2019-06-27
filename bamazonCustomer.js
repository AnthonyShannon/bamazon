var inquirer = require("inquirer")
var mysql = require("mysql");
var itemID;
var itemQuantity;
var productName;
var productInventory;
var newProductInventory;
var confirmOrder;
var productPrice;

// configure database
var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'alphaCoder90',
    database: 'bamazon'
});

// connect to database
connection.connect(function (err) {
    if (err) throw err;

});
// function to update inventory in database if product is purchased
function updateProduct() {
    connection.query("UPDATE products SET ? WHERE ?",
        [
            {
                inventory: newProductInventory
            },
            {
                id: itemID
            }
        ],
        function (err, res) {
            if (err) throw err;
            console.log("Thank you for your order, your total comes out to $" + productPrice * itemQuantity)
        });
}

// function to run the programnode 
function goShopping() {
    connection.query('SELECT id, product_name, department_name, price_USD FROM products', function (error, results, fields) {
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
                itemID = answer.itemID;
                itemQuantity = answer.amount;
                // get info for requested product
                connection.query('SELECT * FROM products WHERE ?',
                    {
                        id: itemID
                    },
                    function (error, results) {
                        if (error) throw error;
                        productName = results[0].product_name;
                        productInventory = results[0].inventory;
                        productPrice = results[0].price_USD;
                        // check to see if there's enough in stock
                        if (itemQuantity > productInventory) {
                            console.log("NOT ENOUGH INVENTORY TO MEET YOUR NEEDS!")
                            connection.end()
                        } else {
                            inquirer
                                .prompt({
                                    name: "confirmOrder",
                                    type: "confirm",
                                    message: "Your order is for " + itemQuantity + " of " + productName + ", is that correct?"
                                })
                                .then(function (answer) {
                                    confirmOrder = answer.confirmOrder
                                    newProductInventory = productInventory - itemQuantity;
                                    // check if user said order is correct
                                    if (confirmOrder === false) {
                                        console.log("Okay, please come back when you can make a purchase.")
                                        connection.end()
                                    } else if (confirmOrder === true) {
                                        updateProduct()
                                        connection.end()
                                    } else {
                                        console.log("database error: please try again later")
                                        connection.end()
                                    }
                                })
                        }
                    })
            })
    })
};
goShopping();