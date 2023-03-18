const mongoose = require('mongoose');
const validator = require('validator');
// const Event = require('./eventModel');
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
  },
  sellingStartTime: {
    type: Date,
    default: Date.now(),
    validate: [validator.isDate, 'Must be right date format.'],
  },
  sellingEndTime: {
    type: Date,
    validate: [validator.isDate, 'Must be right date format.'],
  },
  currentReservations: {
    type: Number,
    default: 0,
    max: [10000000, 'Maximum Conceivable capacity reached'],
  },
  eventID: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'Ticket Type must belong to an event.'],
  },
});
//automatically adds 1 to ticketsSold in its respective Event
ticketSchema.post('findByIdAndUpdate', async function (next) {
  await Event.findByIdAndUpdate(this.eventID, {
    $inc: { ticketsSold: 1 },
  });
});
//All find querries
ticketSchema.pre(/^find/, function (next) {
  this.select({
    __v: 0,
  });
  next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
