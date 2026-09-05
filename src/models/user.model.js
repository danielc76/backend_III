import mongoose from 'mongoose';
import { USER_ROLES } from '../constants/index.js';
import { fileMetadataSchema } from './schemas/fileMetadata.schema.js';


const userSchema = new mongoose.Schema({

  firstName: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },

  lastName: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true
  },

  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true
  },

  password: {
    type: String,
    required: [true, 'La contrasena es obligatoria']
  },

  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.CUSTOMER
  },

  documents: {
    type: [fileMetadataSchema],
    default: []
  }

}, {
  timestamps: true,
  toJSON: {
    transform: (document, returnedObject) => {

      // La contraseña se guarda en MongoDB, pero no debe
      // formar parte de las respuestas de la API.
      delete returnedObject.password;

      return returnedObject;

    }
  }
});


const User = mongoose.model('User', userSchema);

export default User;
