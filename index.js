const RAW_DATA_STORAGE_KEY = `rawVillagerData`
const VILLAGERS_TO_DISPLAY = [
  // Pigs
  `Agnes`, `Gala`, `Curly`, `Maggie`, `Spork`,
  // Birbs
  `Ace`, `Anchovy`, `Peck`, `Piper`, `Robin`, `Sparrow`,
  // Bulls
  `Angus`, `Rodeo`, `T-Bone`,
  // Horses
  `Elmer`, `Papi`, `Winnie`, `Victoria`,
  // Mice
  `Dora`, `Samson`,
  // Goats
  `Billy`, `Chevre`, `Nan`,
  // Chickens
  `Ava`, `Egbert`, `Goose`, `Broffina`,
  // Dogs
  `Bea`, `Bones`, `Butch`, `Goldie`, `Mac`, `Shep`,
  // Ducks
  `Bill`, `Deena`, `Molly`,
  // Sheep
  `Curlos`, `Dom`, `Eunice`, `Vesta`,
  // Frogs
  `Henry`, `Lily`, `Tad`,
  // Rabbits
  `Cole`, `Ruby`,
  // Squirrels
  `Cally`, `Blaire`, `Sally`, `Sylvana`,
  // Wolves
  `Dobie`, `Fang`,
  // Cats
  `Kiki`, `Lolly`, `Rudy`,
]
const IMAGE_PROMISES = []

const SortOptions = {
  CATEGORY: null,
  DIRECTION: null,
}
const Direction = {
  ASCENDING: `ASCENDING`,
  DESCENDING: `DESCENDING`,
}

const DomElements = {
  LOADING_ICON: document.querySelector(`.loading-icon`),
  TABLE: document.querySelector(`.villagers`),
  TABLE_BODY: document.querySelector(`.villagers .villager-rows`),
  TABLE_HEADER_BUTTONS: document.querySelectorAll(`.thead-button`),
}

// Villager data retrieval
function fetchVillagerData() {
  return fetch(`https://acnhapi.com/v1a/villagers`).then(res => res.json())
}
async function loadVillagerData() {
  const localData = localStorage.getItem(RAW_DATA_STORAGE_KEY)
  if (localData !== null) {
    return JSON.parse(localData)
  }
  const dataFromApi = await fetchVillagerData()
  localStorage.setItem(RAW_DATA_STORAGE_KEY, JSON.stringify(dataFromApi))
  return dataFromApi
}

// Villager data display
function createCell(child) {
  const cell = document.createElement(`div`)
  cell.classList.add(`cell`)
  if (typeof child === `string`) {
    cell.textContent = child
  } else if (child instanceof HTMLElement) {
    cell.appendChild(child)
  } else {
    console.warn(`[createCell()]: Returning an empty <div> because the following child does not have defined behavior for rendering:`, child)
  }
  return cell
}
function createIcon(villager) {
  const img = document.createElement(`img`)
  const imgPromise = new Promise(resolve => {
    img.addEventListener(`load`, () => resolve())
  })
  IMAGE_PROMISES.push(imgPromise)
  img.src = villager.icon_uri
  img.alt = `${villager.localName}'s face`
  img.style.setProperty(`--bg-color`, villager['text-color'])
  return img
}
function createVillagerRow(villager) {
  const row = document.createElement(`div`)
  row.classList.add(`row`)
  row.appendChild(createCell(createIcon(villager)))
  row.appendChild(createCell(villager.localName))
  row.appendChild(createCell(villager.personality))
  row.appendChild(createCell(villager.species))
  return row
}
async function displayVillagers(displayData) {
  setVillagerDataInDom(displayData)
  DomElements.TABLE_HEADER_BUTTONS.forEach(button => {
    button.addEventListener(`click`, getHeaderButtonHandler(button, displayData))
  })
  await Promise.all(IMAGE_PROMISES)
  DomElements.LOADING_ICON.remove()
  DomElements.TABLE.classList.remove(`hidden`)

}
function getHeaderButtonHandler(button, displayData) {
  const buttonCategory = button.dataset.column
  return () => {
    if (SortOptions.CATEGORY === buttonCategory) {
      SortOptions.DIRECTION = flipDirection(SortOptions.DIRECTION)
    } else {
      SortOptions.CATEGORY = buttonCategory
      SortOptions.DIRECTION = Direction.ASCENDING
    }
    const sortedData = sortVillagers(displayData)
    setVillagerDataInDom(sortedData)
    updateHeaderButtonIcons()
  }
}
function getVillagerDisplayData(villagerData) {
  return villagerData.reduce((reduced, villager) => {
    const localName = villager.name['name-USen']
    if (!VILLAGERS_TO_DISPLAY.includes(localName)) {
      return reduced
    }
    reduced.push({...villager, localName })
    return reduced
  }, [])
}
function flipDirection(currentDirection) {
  if (currentDirection === Direction.ASCENDING) {
    return Direction.DESCENDING
  }
  return Direction.ASCENDING
}
function setVillagerDataInDom(displayData) {
  DomElements.TABLE_BODY.innerHTML = ``
  IMAGE_PROMISES.length = 0
  for (const villager of displayData) {
    DomElements.TABLE_BODY.appendChild(createVillagerRow(villager))
  }
}
function sortTwoByPrioritizedCategories(villagerA, villagerB, fieldNames) {
  const A_IS_GREATER = SortOptions.DIRECTION === Direction.ASCENDING ? 1 : -1
  const B_IS_GREATER = A_IS_GREATER * -1
  for (const field of fieldNames) {
    if (villagerA[field] > villagerB[field]) return A_IS_GREATER
    if (villagerB[field] > villagerA[field]) return B_IS_GREATER
  }
  return 0
}
function sortVillagers(displayData) {
  return displayData.slice().sort((villagerA, villagerB) => {
    switch (SortOptions.CATEGORY) {
      case 'name':
        return sortTwoByPrioritizedCategories(villagerA, villagerB, [`localName`])
      case 'personality':
        return sortTwoByPrioritizedCategories(villagerA, villagerB, [`personality`, `species`, `localName`])
      case 'species':
        return sortTwoByPrioritizedCategories(villagerA, villagerB, [`species`, `personality`, `localName`])
    }
  })
}
function updateHeaderButtonIcons() {
  for (const button of DomElements.TABLE_HEADER_BUTTONS) {
    if (button.dataset.column === SortOptions.CATEGORY) {
      const iconStyle = SortOptions.DIRECTION === Direction.ASCENDING ? `asc` : `desc`
      button.dataset.iconStyle = iconStyle
    } else {
      button.dataset.iconStyle = `none`
    }
  }
}

// Run it
async function main() {
  const villagerData = await loadVillagerData()
  const displayData = getVillagerDisplayData(villagerData)
  displayVillagers(displayData)
}

main()
