require("dotenv").config()
let inquirer = require("inquirer")
let mysql = require("mysql");
let option
let lowInventory = []
let itemsInStore = []
let amountToRestock
let itemToRestock

let connection = mysql.createConnection({
    host: '127.0.0.1',
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: 'bamazon'
});
connection.connect()
function updateInventory() {
    connection.query("UPDATE products SET inventory = inventory + " + amountToRestock + " WHERE ?",
        {
            product_name: itemToRestock
        },
        function (err, res) {
            if (err) throw err;
            console.log("Okay, you have added to your inventory.")
            connection.end()
        });
}
function addNewItem() {
    connection.query("INSERT INTO products(product_name, department_name, price_USD, inventory) VALUES ('" + newProductName + "', '" + newProductDepartment + "', '" + newProductPrice + "', '" + newProductInventory + "')",
        function (err, res) {
            if (err) throw err;
            console.log("Okay, you have added " + newProductName + " to your store.")
            connection.end()
        });
}
connection.query('SELECT * FROM products WHERE inventory <= 5', function (error, results) {
    if (error) throw error;
    for (let i = 0; i < results.length; i++) {
        lowInventory.push(results[i].product_name)
    }
})
connection.query('SELECT * FROM products', function (error, results) {
    if (error) throw error;
    for (let i = 0; i < results.length; i++) {
        itemsInStore.push(results[i].product_name)
    }
})

function checkDatabase() {
    inquirer
        .prompt({
            name: "options",
            type: "list",
            choices: ["View products for sale", "View low inventory", "Add to inventory", "Add new product"],
            message: "What would you like to do?"
        })
        .then(function (answer) {
            option = answer.options
            switch (option) {
                case "View products for sale":
                    connection.query('SELECT * FROM products', function (error, results) {
                        if (error) throw error;
                        console.table(results)
                        connection.end()
                    })
                    break;
                case "View low inventory":
                    connection.query('SELECT * FROM products WHERE inventory <= 5', function (error, results) {
                        if (error) throw error;
                        console.table(results)
                        connection.end()
                    })
                    break;
                case "Add to inventory":
                    inquirer
                        .prompt([{
                            name: "itemToRestock",
                            type: "list",
                            message: "Which item would you like to restock?",
                            choices: itemsInStore
                        },
                        {
                            name: "amountToRestock",
                            type: "number",
                            message: "How many would you like to order for your inventory?"
                        }])
                        .then(function (answer) {
                            itemToRestock = answer.itemToRestock;
                            amountToRestock = answer.amountToRestock;
                            if (isNaN(amountToRestock)) {
                                console.log("Invalad restock ammount! Please enter a number")
                            } else {
                                inquirer
                                    .prompt({
                                        name: "confirmRestock",
                                        type: "confirm",
                                        message: "Confirm, you would like to order " + amountToRestock + " of " + itemToRestock + " for your inventory?"
                                    })
                                    .then(function (answer) {
                                        if (answer.confirmRestock === false) {
                                            console.log("Okay, cancelling order.")
                                            connection.end()
                                        } else {
                                            updateInventory();
                                        }
                                    })
                            }
                        })
                    break;
                case "Add new product":
                    inquirer
                        .prompt([{
                            name: "newProduct",
                            type: "input",
                            message: "What is the name of the new product?"
                        },
                        {
                            name: "productDepartment",
                            type: "list",
                            message: "What department will this go in?",
                            choices: ["Sports", "Office", "Health", "Electronics"]
                        },
                        {
                            name: "productPrice",
                            type: "number",
                            message: "What is the price of the new item?"
                        },
                        {
                            name: "initialInventory",
                            type: "number",
                            message: "How many are you stocking?"
                        }])
                        .then(function (answer) {
                            newProductName = answer.newProduct;
                            newProductDepartment = answer.productDepartment;
                            newProductPrice = answer.productPrice;
                            newProductInventory = answer.initialInventory;
                            addNewItem();
                        })


            }
        })
}
checkDatabase()
