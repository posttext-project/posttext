import 'prismjs/themes/prism.css'

const socket = new WebSocket('ws://localhost:8080')

socket.addEventListener('message', (event) => {
  const payload = JSON.parse(event.data)

  switch (payload.type) {
    case 'reload': {
      location.reload()
    }
  }
})
