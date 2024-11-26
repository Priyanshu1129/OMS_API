import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Base schema for all users
const userBaseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'hotelowner'], required: true },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    approved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    discriminatorKey: 'role', // This tells Mongoose that the 'role' field will be used to determine which discriminator to use
  }
);

// Middleware to hash passwords
userBaseSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password comparison method
userBaseSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Base model
const User = mongoose.model('User', userBaseSchema);

// Discriminators for different roles without specifying collection
const SuperAdmin = User.discriminator(
  'SuperAdmin',
  new mongoose.Schema({
    // You can add specific fields for SuperAdmin here, if needed
  })
);

const HotelOwner = User.discriminator(
  'HotelOwner',
  new mongoose.Schema({
    // You can add specific fields for HotelOwner here, if needed
  })
);

// Export everything
export { User, SuperAdmin, HotelOwner };




// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// // Base schema for all users
// const userBaseSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { type: String, enum: ['superadmin', 'hotelowner'], required: true },
//     hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
//     approved: { type: Boolean, default: false },
//   },
//   {
//     timestamps: true,
//     discriminatorKey: 'role',
//   }
// );

// // Middleware to hash passwords
// userBaseSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// // Password comparison method
// userBaseSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// // Base model
// const User = mongoose.model('User', userBaseSchema);

// // Discriminators for different roles
// const SuperAdmin = User.discriminator(
//   'SuperAdmin',
//   new mongoose.Schema({}, { collection: 'superadmins' })
// );

// const HotelOwner = User.discriminator(
//   'HotelOwner',
//   new mongoose.Schema({}, { collection: 'hotelowners' })
// );

// // Export everything
// export { User, SuperAdmin, HotelOwner };


