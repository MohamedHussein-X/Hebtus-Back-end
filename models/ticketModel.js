const mongoose = require('mongoose');
const validator = require('validator');
const Event = require('./eventModel');

const ticketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a ticket name'],
    minlength: [1, 'Event Name can not be less than 1 character.'],
    maxlength: [30, 'Event Name can not be more than 30 characters long.'],
  },
  type: {
    type: String,
    required: [true, 'Please specify the ticket type'],
    enum: {
      //ticket types on the site itself are not in vip or not no
      values: ['VIP', 'Regular'],
      message: '{VALUE} is not supported',
    },
  },
  price: {
    type: Number,
    required: [true, 'A ticket must have a price'],
    min: 0,
  },
  capacity: {
    type: Number,
    required: [true, 'please sepcify ticket capacity'],
    max: [10000000, 'Maximum Conceivable capacity reached'],
    default: 1,
    validate: {
      validator: function (val) {
        return val >= this.currentReservations;
      },
      message: 'Capacity is below current reservations',
    },
  },
  sellingStartTime: {
    type: Date,
    default: Date.now(),
    validate: [
      {
        validator: validator.isDate,
        message: 'Must be right date format.',
      },
      {
        validator: function (value) {
          return new Date(value) > new Date();
        },
        message: 'Date must be in the future',
      },
    ],
  },
  sellingEndTime: {
    type: Date,
    validate: [
      {
        validator: validator.isDate,
        message: 'Must be right date format.',
      },
      {
        validator: function (value) {
          return new Date(value) > new Date();
        },
        message: 'Date must be in the future',
      },
      {
        validator: function (value) {
          console.log(value, this.sellingStartTime);
          return value > this.sellingStartTime;
        },
        message: 'End date must be after selling date',
      },
    ],
  },
  currentReservations: {
    type: Number,
    default: 0,
    max: [10000000, 'Maximum Conceivable capacity reached'],
    validate: {
      validator: function (val) {
        return val < this.capacity;
      },
      message: 'Current reservations exceeds the allowed capacity',
    },
  },
  eventID: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'Ticket Type must belong to an event.'],
    unique: true,
  },
});
//automatically adds 1 to ticketsSold in its respective Event
//findOneAndUpdate is called by findbyIdandUpdate
// ticketSchema.pre('findOneAndUpdate', async function (next) {
//   const currentReservationsInc = this._update.$inc.currentReservations;
//   // console.log(currentReservationsInc);
//   const docToUpdate = await this.model.findById(this._conditions._id);
//   // console.log(this.model);
//   // console.log(docToUpdate);

//   //check on capacity
//   if (
//     currentReservationsInc + docToUpdate.currentReservations >
//     docToUpdate.capacity
//   ) {
//     //do nothing
//     //or actually refuse update?
//     //make error to stop update?
//     next();
//   }
//   await Event.findByIdAndUpdate(docToUpdate.eventID, {
//     $inc: { ticketsSold: currentReservationsInc },
//   });
// });
// // ticketSchema.post('findByIdAndUpdate', async (doc) => {
// //   console.log(doc);
// //   await Event.findByIdAndUpdate(doc.eventID, {
// //     $inc: { ticketsSold: 1 },
// //   });
// // });
// //All find querries
ticketSchema.pre(/^find/, function (next) {
  this.select({
    __v: 0,
  });
  next();
});
ticketSchema.pre('findOneAndUpdate', function (next) {
  this.options.runValidators = true;
  next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
