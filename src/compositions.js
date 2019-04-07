const { resetClassName } = require('./utils')
const ProgramList = require('./program-list')

const previous = JSON.parse(localStorage.getItem('compositions'))
const compositions = new ProgramList(previous)
const compositionsElem = document.getElementById('compositions')

const haveCompositions = () => compositions.length
const saveCompositions = () => localStorage.setItem('compositions', JSON.stringify(compositions.list))

const getCompositionPrograms = () => {
  return JSON.parse(JSON.stringify(compositions.getSelected()))
}

const addToCompositions = (v) => {
  compositions.add({
    name: `Composition #${compositions.length}`,
    programs: v
  })
  saveCompositions()
  renderCompositions()
}

const renderCompositions = () => {
  compositionsElem.innerHTML = ''

  compositions.list.forEach((item, idx) => {
    const compositionItemElem = document.createElement('div')
    compositionItemElem.className = 'program-item'
    compositionItemElem.dataset.idx = idx

    const removeElem = document.createElement('div')
    removeElem.className = 'close'
    compositionItemElem.appendChild(removeElem)
    removeElem.addEventListener('click', (event) => {
      event.stopPropagation()
      compositions.remove(idx)
      saveCompositions()
      renderCompositions()
    })

    if (idx === compositions.selectedIndex) {
      compositionItemElem.classList.add('selected')
    }

    const nameInput = document.createElement('input')
    nameInput.value = item.name
    nameInput.oninput = () => {
      item.name = nameInput.value
      saveCompositions()
    }
    compositionItemElem.appendChild(nameInput)
    compositionItemElem.addEventListener('click', () => {
      compositions.setSelected(idx)
      resetClassName('#compositions .program-item', 'program-item')
      compositionItemElem.classList.add('selected')
    })
    compositionsElem.appendChild(compositionItemElem)
  })
}

module.exports = {
  haveCompositions,
  getCompositionPrograms,
  addToCompositions,
  renderCompositions
}
