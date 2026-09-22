import { uiElement, setLoader, renderWeatherData, renderRecentChips, renderError, clearError, updateThemeIcon, updateUnitToggle, renderCityList} from "./ui.js";
import { getWeatherByCoord, getFlagUrl, getWeatherData } from "./api.js";

const THEME = "theme"
const RECENT = "recent"
const UNITS = "units"

const body = document.body

//global  obje
const STATE = {
    theme: localStorage.getItem(THEME) || 'dark',
    recent: JSON.parse(localStorage.getItem(RECENT) || '[]'),
    units: localStorage.getItem(UNITS) || 'metric'
}

//ekran yuklenince
document.addEventListener("DOMContentLoaded",()=>{

    handleGeoSearch()

    updateUnitToggle(STATE.units)

    renderCityList()

    body.setAttribute("data-theme", STATE.theme)
    updateThemeIcon(STATE.theme)

    renderRecentChips(STATE.recent, (city)=>{
        uiElement.searchInput.value = city
        handleSearch(city)
    })

})

//kullanici konumu al
const handleGeoSearch = () =>{

    window.navigator.geolocation.getCurrentPosition(
        async (position) => {
            const {latitude, longitude} = position.coords

            setLoader(true)

            //istek at
            const data = await getWeatherByCoord(latitude, longitude, STATE.units)

            setLoader(false)

            const flagUrl = getFlagUrl(data.sys.country)

            renderWeatherData(data, flagUrl, STATE.units)

            console.log(flagUrl)

            pushRecent(data.name)

        },
        ()=>{
            //hata goster
            renderError("konumu desteklemiyor")
        }
    )
}

//son aratilanlari ekle
const pushRecent = (city) => {

    const updated = [city, ...STATE.recent.filter((c)=>c.toLowerCase() != city.toLowerCase())].slice(0,6)

    STATE.recent = updated

    renderRecentChips(STATE.recent,(city)=>{
        uiElement.searchInput.value = city
        //arama yap
        handleSearch(city)
    })

    //kaydet bunlari
    persist()

}

//local e kayder
const persist = () => {
    localStorage.setItem(THEME, STATE.theme)
    localStorage.setItem(RECENT, JSON.stringify(STATE.recent))
    localStorage.setItem(UNITS, STATE.units)
}


//form submit olursa
uiElement.searchForm.addEventListener("submit",(e)=>{
    e.preventDefault()

    const city = uiElement.searchInput.value
    handleSearch(city)
})

const handleSearch = async (city) => {

    const name = city.trim()

    if (!name) {
        renderError("sehir bos olamaz")
        return
    }

    clearError()


    setLoader(true)

    try{

        const data = await getWeatherData(city, STATE.units)

        if (data.cod == "404") {
            renderError("sehiw bulunamadi")
            return
        }

        const flagUrl = getFlagUrl(data.sys.country)

        pushRecent(name)

        renderWeatherData(data,flagUrl, STATE.units)
        
    }catch(error){

        renderError(error.message || "sehir bulunamadi")

    }finally{
        setLoader(false)
    }
}


//tema icin tiklanma
uiElement.themeBtn.addEventListener("click",()=>{
    STATE.theme = STATE.theme == "light" ? "dark": "light"

    body.setAttribute("data-theme", STATE.theme)

    persist()

    updateThemeIcon(STATE.theme)
})

//birim alani tiklanmasi
uiElement.unitToggle.querySelectorAll("button").forEach((btn)=>{
    btn.addEventListener("click", async ()=>{
        const nextUnits = btn.value

        if (STATE.units === nextUnits) {
            return
        }

        STATE.units = nextUnits

        persist()

        updateUnitToggle(STATE.units)

        handleSearch(STATE.recent[0])
    })
})

uiElement.locateBtn.addEventListener("click",()=>{
    uiElement.searchInput.value = ""
    handleGeoSearch()
})