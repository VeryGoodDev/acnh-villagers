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

const DomElements = {
  TABLE: document.querySelector(`table`),
  TABLE_BODY: document.querySelector(`table tbody`)
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
  // FIXME: Make sure stringified correctly
  localStorage.setItem(RAW_DATA_STORAGE_KEY, JSON.stringify(dataFromApi))
  return dataFromApi
}

// Villager data display
function createIcon(villager) {
  const img = document.createElement(`img`)
  img.src = villager.icon_uri
  img.alt = `${villager.localName}'s face`
  img.style.setProperty(`--bg-color`, villager['text-color'])
  return img
}
function createTd(child) {
  const td = document.createElement(`td`)
  if (typeof child === `string`) {
    td.textContent = child
  } else if (child instanceof HTMLElement) {
    td.appendChild(child)
  } else {
    console.warn(`[createTd()]: Returning an empty <td> because the following child does not have defined behavior for rendering:`, child)
  }
  return td
}
function createVillagerRow(villager) {
  const row = document.createElement(`tr`)
  row.appendChild(createTd(createIcon(villager)))
  row.appendChild(createTd(villager.localName))
  row.appendChild(createTd(villager.personality))
  row.appendChild(createTd(villager.species))
  return row
}
function displayVillagers(villagerData) {
  const displayData = getVillagerDisplayData(villagerData)
  for (const villager of displayData) {
    DomElements.TABLE_BODY.appendChild(createVillagerRow(villager))
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

// Run it
async function main() {
  const villagerData = await loadVillagerData()
  displayVillagers(villagerData)
}

main()
