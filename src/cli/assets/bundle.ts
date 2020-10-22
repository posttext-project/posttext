/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

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
