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
  socket.on('new_player', state => {
    console.log('New player connecting with state:', state);
    players[socket.id] = state;

    //Give new players a spawn position
    let randPos = getRandPos();
    players[socket.id].x = randPos.x;
    players[socket.id].y = randPos.y;
    socket.emit('new_spawn', {
      x: randPos.x,
      y: randPos.y
    });

    // Emit the update-players method in the client side
    io.emit('player_connect', state);
  })

  //Give respawning players a spawn position
  socket.on('respawn', () => {
    let randPos = getRandPos()
    players[socket.id].x = randPos.x;
    players[socket.id].y = randPos.y;
    socket.emit('new_spawn', {
      x: randPos.x,
      y: randPos.y
    })
    io.emit('player_connect', players[socket.id])
  })

  socket.on('death', () => {
    io.emit('player_disconnect', socket.id);
  })

  socket.on('get_all_players', () => {
    socket.emit('player_list', players);
  })

  socket.on('disconnect', state => {
    delete players[socket.id]
    io.emit('player_disconnect', socket.id);
  })

  //Send bullets being shot to all clients
  socket.on('shoot_bullet', data => {
    io.emit('new_bullet', data);
  })

  // When a player moves
  socket.on('move_player', data => {
    const { x, y, id, velocity } = data

    // If the player is invalid, return
    if (players[socket.id] === undefined) {
      return
    }

    // Update the player's data if he moved
    if (players[socket.id].x !== x || players[socket.id].y !== y) {
      players[socket.id].x = x
      players[socket.id].y = y
      players[socket.id].id = id
      players[socket.id].velocity = {
        x: velocity.x,
        y: velocity.y
      }

      // Send the data back to the client
      io.emit('update_player', data);
    }
  })
})

function getRandPos() {
  let positions = [{x: 600, y: 200}, {x: 90, y: 200}, {x: 580, y: 525}, {x: 1160, y: 240}, {x: 1090, y: 560}, {x: 850, y: 335}, {x: 160, y: 560}];
  let random = Math.round(Math.random() * (positions.length-1));
  return positions[random];
}