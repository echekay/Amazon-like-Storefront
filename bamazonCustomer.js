const mysql = require('mysql');
const inquirer = require('inquirer');

var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'bamazon'
});

connection.connect(function(err) {
  if (err) throw err;
  showStore();
});

function showStore() {
  const query = 'SELECT item_id, product_name, price FROM products';
  connection.query(query, function(err, res) {
    // console.log(res);
    console.log("Welcome to Bamazon\n----------");
    for (let i = 0; i < res.length; i++) {
      console.log(`Item #: ${res[i].item_id} || Product Name: ${res[i].product_name} || Price: $${res[i].price}`);
    }
    console.log('----------');
    startShopping();
  });
}

function startShopping() {
  inquirer
    .prompt([
      {
        name: 'id',
        type: 'input',
        message: "What is the item number of the product you'd like to purchase?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      {
        name: 'quantity',
        type: 'input',
        message: 'How many units of this item would you like to purchase?',
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answer) {
      var query = 'SELECT * FROM products WHERE ?';
      connection.query(query, { item_id: answer.id }, function(err, res) {
        if (err) throw err;
        if (answer.quantity <= res[0].stock_quantity) {
        console.log('Amount in inventory: ' + res[0].stock_quantity);
          var updatedItemQuantity = res[0].stock_quantity - answer.quantity;
          var query2 = 'Update products SET ? WHERE ?';
          connection.query(query2, [{stock_quantity: updatedItemQuantity}, res[0]].stock_quantity, function(err, res) {
            console.log(query);
          })
          console.log('Total cost of your purchase = $' + (res[0].price * answer.quantity));
          startShopping();
        }
        else {
          console.log("There's not enough inventory to fulfill your order. Please order again.");
          startShopping();
        }
      });
    });
}