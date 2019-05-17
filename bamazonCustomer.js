var inquirer = require("inquirer")
var mysql = require("mysql");
var itemID;
var itemQuantity;
var productName;
var productInventory;
var newProductInventory;
var confirmOrder;
var productPrice;

var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '****',
    database: 'bamazon'
});

connection.connect(function (err) {
    if (err) throw err;

});
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


function start() {
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
                        productPrice = results[0].price_USD;
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


    
    //     var sql = "UPDATE customers SET address = 'Canyon 123' WHERE address = 'Valley 345'";
    //   con.query(sql, function (err, result) {
    //     if (err) throw err;
    //     console.log(result.affectedRows + " record(s) updated");
    //   });
};
start();

