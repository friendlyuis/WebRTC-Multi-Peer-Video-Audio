var express = require('express')

var app = (module.exports = express.createServer())

var io = require('socket.io')(app)

io.on('connection', function (socket, podId) {
  console.log('connection')

  io.sockets.emit(
    'user-joined',
    socket.id,
    io.engine.clientsCount,
    Object.keys(io.sockets.clients().sockets)
  )

  socket.on('signal', (toId, message) => {
    console.log('signal')
    io.to(toId).emit('signal', socket.id, message)
  })

  socket.on('join', (data) => {
    socket.join(data.podId, (err) => {
      console.log('is it sending this?', {data})
      if (err) {
        console.log({ err })
      }
      io.to(data.podId).emit(
        'message',
        socket.id,
        JSON.stringify({
          joinUserId: data.joinUserId,
          offerOrigin: socket.id,
          podId: data.podId,
          offer: data.offer,
          answer: data.answer,
        })
      )
    })
  })

  socket.on('leave', (podId) => {
    socket.leave(podId, (err) => {
      if (err) {
        console.log({ err })
      }
    })
  })

  socket.on('message', (message) => {
    try {
      const data = JSON.parse(message)
      if(data.offer) {
        console.log('got offer', {data})
      }

      io.to(data.to ? data.to : data.podId).emit(
        'message',
        socket.id,
        JSON.stringify({
          to: data.to,
          joinUserId: data.joinUserId,
          podId: data.podId,
          offerOrigin: data.offerOrigin,
          answer: data.answer,
          iceCandidate: data.iceCandidate,
          offer: data.offer,
        })
      )
    } catch (err) {
      console.log({ err })
    }
  })

  socket.on('disconnect', function () {
    io.sockets.emit('user-left', socket.id)
  })
})

app.listen(3001, function () {
  console.log(
    'Express server listening on port %d in %s mode',
    app.address().port,
    app.settings.env
  )
})
