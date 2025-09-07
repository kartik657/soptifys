let currsong = new Audio()
let songs
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://192.168.137.1:3000/${folder}/`);
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = await div.getElementsByTagName("a")
    console.log(as);
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let filename = element.href.split("/").pop();
            if (filename) {
                songs.push(filename);
            }
        }
    }



    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUl.innerHTML = " ";

    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li><img class="inverted" src="music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>Kartik </div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                            <img class="inverted" src="assests/img/play-circle-svgrepo-com.svg" alt=""> 
                            </div>
                            </li>`;

    }
    Array.from(
        document.querySelector(".songlist").getElementsByTagName("li")
    ).forEach(e => {
        e.addEventListener("click", element => (
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        ))
        // console.log(e.querySelector(".info").firstElementChild.innerHTML);
    })
    return songs

}

const playmusic = (track, pause = false) => {
    currsong.src = `/${currfolder}/` + track;
    if (!pause) {
        currsong.play()
        play.src = "pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";

}
async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".card-container")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json(); 
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                  <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 60 60">
                                <defs>
                                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style="stop-color:#66ff66; stop-opacity:1" />
                                        <stop offset="100%" style="stop-color:#009900; stop-opacity:1" />
                                    </linearGradient>
                                </defs>
                                <circle cx="30" cy="30" r="30" fill="url(#grad)" />
                                <polygon points="22,18 22,42 42,30" fill="white" />
                            </svg>
            </div>

            <img src="/songs/${folder}/img.jpeg" alt="">

            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
     Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)  
            playmusic(songs[0])


        })
    })

}

async function main() {


    await getsongs("songs/Arjit singh")
    console.log(songs);
    playmusic(songs[0], true)

    displayAlbums()


    play.addEventListener("click", () => {
        if (currsong.paused) {
            currsong.play();
            play.src = "pause.svg"
        }
        else {
            currsong.pause();
            play.src = "play.svg"
        }

    })

    currsong.addEventListener("timeupdate", () => {

        console.log(currsong.currentTime, currsong.duration)
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currsong.currentTime)} / ${secondsToMinutesSeconds(currsong.duration)}`
        document.querySelector(".circle").style.left = (currsong.currentTime / currsong.duration) * 100 + "%"
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        // console.log(e.target.getboundingClientRect().width,e.offsetX)
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currsong.currentTime = ((currsong.duration) * percent) / 100
    })


    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    })


    previous.addEventListener("click", () => {
        console.log("previous clicked");
        console.log(currsong.src)
        let index = songs.indexOf(currsong.src.split("/").splice(-1)[0]);
        if (index - 1 >= 0) {
            playmusic(songs[index - 1])
        }



    })

    next.addEventListener("click", () => {
        console.log("previous clicked");
        let index = songs.indexOf(currsong.src.split("/").splice(-1)[0]);
        if (index + 1 < songs.length) {
            playmusic(songs[index + 1])
        }

    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currsong.volume = parseInt(e.target.value) / 100
        if (currsong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }

    })

    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)

        })
    })

}

main(); 