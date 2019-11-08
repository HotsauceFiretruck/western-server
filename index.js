'use strict'
const express = require('express');
const socket = require('socket.io');
const http = require('http');


var app = express(),
  server = http.createServer(app),
  io = socket.listen(server)

server.listen(process.env.PORT || 3000);

const players = {}

io.on('connection', socket => {
  // When a player connects
  socket.on('new-player', state => {
    console.log('New player joined with state:', state)
    players[socket.id] = state
    // Emit the update-players method in the client side
    io.emit('update-players', players)
  })

  socket.on('disconnect', state => {
    delete players[socket.id]
    io.emit('update-players', players)
  })

  socket.on('new-bullet', data => {
    io.emit('send-bullet', data);
  })

  // When a player moves
  socket.on('move-player', data => {
    const { x, y, playerName, velocity } = data

    // If the player is invalid, return
    if (players[socket.id] === undefined) {
      return
    }

    // Update the player's data if he moved
    players[socket.id].x = x
    players[socket.id].y = y
    players[socket.id].playerName = {
      name: playerName.name
    }
    players[socket.id].velocity = {
      x: velocity.x,
      y: velocity.y
    }

    // Send the data back to the client
    io.emit('update-players', players)
  })
})