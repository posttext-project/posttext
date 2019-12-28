import 'prismjs/themes/prism.css'

const socket = new WebSocket('ws://localhost:8080')

async function loadDoc() {
  const response = await window.fetch(
    'http://localhost:8080/doc.html'
  )

  document.body.innerHTML = await response.text()
}

socket.addEventListener('message', event => {
  const payload = JSON.parse(event.data)

  switch (payload.type) {
    case 'reload': {
      loadDoc()
    }
  }
})

window.addEventListener('load', () => loadDoc())
