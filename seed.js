const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/laundryflow')
  .then(async () => {
    console.log('Connected to MongoDB');
    const existingUser = await User.findOne({ email: 'owner@laundryflow.com' });
    if (existingUser) {
      console.log('Shop Owner already exists!');
      process.exit();
    }

    await User.create({
      name: 'Shop Owner',
      shopName: 'My Laundry Shop',
      email: 'owner@laundryflow.com',
      password: 'password123'
    });

    console.log('Shop Owner Account Created Successfully!');
    console.log('Email: owner@laundryflow.com');
    console.log('Password: password123');
    process.exit();
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
