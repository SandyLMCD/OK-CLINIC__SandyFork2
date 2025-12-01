const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('./models/User');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/pawcare_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const hashed = await bcrypt.hash('admin123', 10);

  const admin = await User.create({
    name: 'Clinic Admin',
    email: 'admin@okclinic.com',
    password: hashed,
    phone: '0000000000',
    address: 'Clinic',
    role: 'admin',
  });

  console.log('Admin created:', admin.email);
  await mongoose.disconnect();
}

run().catch(console.error);
