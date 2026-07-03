const canvas = document.querySelector('#game')
const ctx = canvas.getContext('2d')
const loadingVeil = document.querySelector('#loading-veil')
const loadingString = document.querySelector('#loading-string')

let state = 'title'
const keys = {}

const player = {
    x: 100,
    y: 100,
    size: 24,
    speed: 220,
}

function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
}

window.addEventListener('resize', resize)
resize()

loadingString.addEventListener('click', (event) => {
    event.stopPropagation()
    state = 'playing'
    loadingVeil.classList.add('pointer-events-none', 'opacity-0')
    canvas.focus()
})

window.addEventListener('keydown', (event) => {
    keys[event.key] = true
})

window.addEventListener('keyup', (event) => {
    keys[event.key] = false
})

let lastTime = performance.now()

function loop(now) {
    const dt = (now - lastTime) / 1000
    lastTime = now

    update(dt)
    draw()

    requestAnimationFrame(loop)
}

function update(dt) {
    if (state !== 'playing') return

    if (keys.ArrowLeft) player.x -= player.speed * dt
    if (keys.ArrowRight) player.x += player.speed * dt
    if (keys.ArrowUp) player.y -= player.speed * dt
    if (keys.ArrowDown) player.y += player.speed * dt
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (state === 'playing') {
        ctx.fillStyle = 'hotpink'
        ctx.fillRect(player.x, player.y, player.size, player.size)
    }
}

requestAnimationFrame(loop)
