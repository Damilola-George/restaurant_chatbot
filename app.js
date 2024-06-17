const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);


app.use(express.static('public'));

// Menu items
const menuItems = [
  { id: 1, name: 'Amala', options: ['Ewedu', 'Gbegiri', 'Efo riro'] },
  { id: 2, name: 'Rice', options: ['Jollof', 'Fried', 'White'] },  
  { id: 3, name: 'Pizza', options: ['Pepperoni', 'Mushroom', 'Veggie'] },
  { id: 4, name: 'Burger', options: ['Cheese', 'Bacon', 'Avocado'] },
  { id: 5, name: 'Salad', options: ['Caesar', 'Greek', 'Garden'] },
 
  // Add more menu items as needed
];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// In-memory storage for orders
const orders = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send initial options
  socket.emit('message', 'Welcome to the Georgettes Restaurant Chatbot!');
  socket.emit('message', 'Select 1 to Place an order');
  socket.emit('message', 'Select 99 to checkout order');
  socket.emit('message', 'Select 98 to see order history');
  socket.emit('message', 'Select 97 to see current order');
  socket.emit('message', 'Select 0 to cancel order');

  // Handle user input
  socket.on('message', (msg) => {
    const userInput = parseInt(msg);

    switch (userInput) {
      case 1:
        // Place an order
        socket.emit('message', 'Here is the menu:');
        menuItems.forEach((item) => {
          socket.emit('message', `${item.id}. ${item.name} (Options: ${item.options.join(', ')})`);
        });
        socket.emit('message', 'Select an item number to add it to your order.');
        break;
      case 99:
        // Checkout order
        if (orders[socket.id]) {
          socket.emit('message', 'Order placed!');
          delete orders[socket.id];
          socket.emit('message', 'Select 1 to place a new order.');
        } else {
          socket.emit('message', 'No order to place.');
        }
        break;
      case 98:
        // Order history
        if (orders[socket.id]) {
          socket.emit('message', `Your order history: ${orders[socket.id].join(', ')}`);
        } else {
          socket.emit('message', 'No order history found.');
        }
        break;
      case 97:
        // Current order
        if (orders[socket.id]) {
          socket.emit('message', `Your current order: ${orders[socket.id].join(', ')}`);
        } else {
          socket.emit('message', 'No current order found.');
        }
        break;
      case 0:
        // Cancel order
        if (orders[socket.id]) {
          socket.emit('message', 'Order canceled.');
          delete orders[socket.id];
        } else {
          socket.emit('message', 'No order to cancel.');
        }
        break;
      default:
        // Add item to order
        const selectedItem = menuItems.find((item) => item.id === userInput);
        if (selectedItem) {
          if (!orders[socket.id]) {
            orders[socket.id] = [];
          }
          orders[socket.id].push(selectedItem.name);
          socket.emit('message', `${selectedItem.name} added to your order.`);
          socket.emit('message', 'Select another item or 99 to checkout.');
        } else {
          socket.emit('message', 'Invalid selection. Please try again.');
        }
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    delete orders[socket.id];
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
