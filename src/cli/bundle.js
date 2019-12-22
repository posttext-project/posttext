const socket = new WebSocket('ws://localhost:8080')

socket.addEventListener('message', event => {
  document.body.innerHTML = event.data
})
