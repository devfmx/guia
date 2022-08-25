const botones = document.querySelectorAll('.lista-menu button')

function removerClase() {
    for (let i = 0; i < botones.length; i++) {
        const botonActual = botones[i]
        botonActual.classList.remove('active')
    }
}

for (let i = 0; i < botones.length; i++) {
    const botonActual = botones[i]
    botonActual.addEventListener('click', function(){
            removerClase()
            botonActual.className = 'active'
    })
}

const botonMenu = document.querySelector('#menu')
const menu = document.querySelector('.lista-menu')
console.log("🚀 ~ file: main.js ~ line 20 ~ menu", menu)

botonMenu.addEventListener('click', function(){
    if (menu.hasAttribute('hidden')){
        botonMenu.textContent = 'Menu'
        menu.removeAttribute('hidden')
    } else {
        botonMenu.textContent = 'Ver menu'
        menu.setAttribute('hidden', 'true' )        
    }
})