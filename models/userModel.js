import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Base schema for all users
const userBaseSchema = new mongoose.Schema({
  logo : { type: String }, 
  gender : { type : string, enum:['M', 'F', 'O']},  
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone : {type : String, require: true},
  password: { type: String, required: true },
  role: { type: String, required: true },  // Role field remains the same
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  isApproved: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false }, // for email verification
  otpDetails: { value: { type: Number, default: null }, expiry: { type: Date, default: null } },
  membershipExpires: { type: Date, default: null },
}, {
  timestamps: true,
});

// Middleware to hash passwords before saving
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

// Model for SuperAdmin with its own collection
const SuperAdminSchema = userBaseSchema.clone();  // Clone the base schema
const SuperAdmin = mongoose.model('SuperAdmin', SuperAdminSchema, 'superadmins');  // Explicitly set collection name

// Model for HotelOwner with its own collection
const HotelOwnerSchema = userBaseSchema.clone();  // Clone the base schema
const HotelOwner = mongoose.model('HotelOwner', HotelOwnerSchema, 'hotelowners');  // Explicitly set collection name

export { User, SuperAdmin, HotelOwner };  // Export User explicitly



// was using discriminators before but they were not working as needed

// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// // Base schema for all users
// const userBaseSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { type: String, required: true },  // No enum here, as it's managed by discriminators
//     // role: {
//     //   type: String,
//     //   required: true,
//     //   enum: ['superadmin', 'hotelowner'], // Ensure only valid roles
//     // },
//     hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
//     isApproved: { type: Boolean, default: false },
//   },
//   {
//     timestamps: true,
//     discriminatorKey: '__t',
//   }
// );

// // Middleware to hash passwords before saving
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
//   new mongoose.Schema({
//     // Additional fields specific to SuperAdmin can go here
//     permissions: { type: [String], default: ['all'] }, // Example field
//   }, { collection: 'superadmins' })  // Explicitly set collection name
// );

// const HotelOwner = User.discriminator(
//   'HotelOwner',
//   new mongoose.Schema({
//     // Additional fields specific to HotelOwner can go here
//     hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }, // Example field
//   }, { collection: 'hotelowners' })  // Explicitly set collection name
// );

// export { User, SuperAdmin, HotelOwner };
