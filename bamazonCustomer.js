require("dotenv").config()
let inquirer = require("inquirer")
let mysql = require("mysql");
let itemID;
let itemQuantity;
let productName;
let productInventory;
let newProductInventory;
let confirmOrder;
let productPrice;

// configure database
let connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: 'bamazon'
});

// connect to database
connection.connect(err => {
    if (err) throw err;

});
// function to update inventory in database if product is purchased
const updateProduct = () => {
    connection.query("UPDATE products SET ? WHERE ?",
        [
            {
                inventory: newProductInventory
            },
            {
                id: itemID
            }
        ],
        (err, res) => {
            if (err) throw err;
            console.log("Thank you for your order, your total comes out to $" + productPrice * itemQuantity)
        });
}

// function to run the programnode 
const goShopping = () => {
    connection.query('SELECT id, product_name, department_name, price_USD FROM products', (error, results, fields) => {
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
            .then(answer => {
                itemID = answer.itemID;
                itemQuantity = answer.amount;
                // get info for requested product
                connection.query('SELECT * FROM products WHERE ?',
                    {
                        id: itemID
                    },
                    (error, results) => {
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
                                .then(answer => {
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