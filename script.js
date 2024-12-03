const carousel = document.getElementById("carousel");
const lyricsContainer = document.getElementById("lyrics-container");
const body = document.body;

let currentAlbumIndex = 0;
let currentSongIndex = 0;
let albums = [];
let debounceTimeout = null;

// Initialize Color Thief
const colorThief = new ColorThief();

// Fetch JSON data using async/await
async function fetchDataset() {
    try {
        const response = await fetch("Taylor_Swift_Genius_Data.json");
        const data = await response.json();
        albums = groupByAlbum(data); // Group songs by album
        createCarouselCards(albums); // Create carousel cards
        createStackedLyrics(); // Create stacked lyrics
        updateUI(); // Display first album and song
    } catch (error) {
        console.error("Error fetching JSON:", error);
    }
}

// Call fetchDataset
fetchDataset();
// Group songs by album
function groupByAlbum(data) {
    return data.reduce((acc, song) => {
        const album = acc.find((a) => a.Album === song.Album);
        if (album) {
            album.songs.push(song);
        } else {
            acc.push({ Album: song.Album, Image: song.Image, songs: [song] });
        }
        return acc;
    }, []);
}

// Create carousel cards for albums
function createCarouselCards(albums) {
    carousel.style.backgroundImage = `url(${albums[currentAlbumIndex].Image})`;
}

// Create stacked lyrics cards
function createStackedLyrics() {
    lyricsContainer.innerHTML = ""; // Clear existing lyrics

    const currentAlbum = albums[currentAlbumIndex];
    currentAlbum.songs.forEach((song, index) => {
        const card = document.createElement("div");
        card.className = "song-card";
        card.dataset.songIndex = index; // Associate index for song selection
        card.innerHTML = `
            <h2>${song["Song Name"]}</h2>
            <p>${song.Lyrics}</p>
        `;
        lyricsContainer.appendChild(card);
    });

    updateStackedLyrics(); // Activate the first card
}

// Update stacked lyrics based on the current song index
function updateStackedLyrics() {
    const cards = document.querySelectorAll(".song-card");

    cards.forEach((card, index) => {
        if (index === currentSongIndex) {
            card.classList.add("active");
            card.classList.remove("hidden");
        } else if (index < currentSongIndex) {
            card.classList.add("hidden");
            card.classList.remove("active");
        } else {
            card.classList.remove("active", "hidden");
        }
    });
    
    // Animate transition for active card
    const activeCard = document.querySelector(".song-card.active");
    if (activeCard) {
        gsap.fromTo(
            activeCard,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        );
    }
}

const albumAudioMapping = {
    "Taylor Swift": "music/APerfectlyGoodHeart.mp3",
    "Fearless": "music/LoveStory.mp3",
    "Speak Now": "music/Enchanted.mp3",
    "Red": "music/22.mp3",
    "1989": "music/Wildestdreams.mp3",
    "Reputation": "music/Gorgeous.mp3",
    "Lover": "music/CruelSummer.mp3",
    "folklore": "music/august.mp3",
    "evermore": "music/Evermore.mp3",
    "Midnights": "music/Karma.mp3"
    // Add mappings for all albums
};


// Update the UI (album and lyrics)
function updateUI() {
    const currentAlbum = albums[currentAlbumIndex];

    // Update album image
    carousel.style.backgroundImage = `url(${currentAlbum.Image})`;

    // Recreate lyrics stack on album change
    createStackedLyrics();

    // Update background music only if the album changes
    const albumName = currentAlbum.Album; // Get current album name
    const albumAudio = albumAudioMapping[albumName]; // Fetch audio file path
    const audioElement = document.getElementById("background-music");
    const audioSource = document.getElementById("audio-source");

    if (audioSource.src !== window.location.origin + "/" + albumAudio) {
        // Only update and play audio if it's a new album
        audioSource.src = albumAudio;
        audioElement.load();
        audioElement.play().catch((err) => {
            console.error("Music playback failed:", err);
        });
    }


    // Extract and apply gradient background
    const img = new Image();
    img.src = currentAlbum.Image;

    img.onload = () => {
        const colors = colorThief.getPalette(img, 2); // Get dominant and secondary colors
        const dominantColor = `rgb(${colors[0].join(",")})`;
        const secondaryColor = `rgb(${colors[1].join(",")})`;

        gsap.to(body, {
            background: `linear-gradient(135deg, ${dominantColor}, ${secondaryColor})`,
            duration: 1.5,
        });
    };
}

// Handle scroll for changing songs and albums
document.addEventListener("wheel", (e) => {
    if (debounceTimeout) return; // Prevent multiple triggers

    debounceTimeout = setTimeout(() => {
        if (e.deltaY > 0) {
            changeSong(1); // Scroll down to next song
        } else {
            changeSong(-1); // Scroll up to previous song
        }
        clearTimeout(debounceTimeout);
        debounceTimeout = null;
    }, 300); // Adjust debounce delay for smoothness
});

// Change song with animations
function changeSong(direction) {
    const totalAlbums = albums.length;

    currentSongIndex += direction;

    if (currentSongIndex < 0) {
        // Go to the previous album's last song
        currentAlbumIndex = (currentAlbumIndex - 1 + totalAlbums) % totalAlbums;
        currentSongIndex = albums[currentAlbumIndex].songs.length - 1;
    } else if (currentSongIndex >= albums[currentAlbumIndex].songs.length) {
        // Go to the next album's first song
        currentAlbumIndex = (currentAlbumIndex + 1) % totalAlbums;
        currentSongIndex = 0;
    }

    updateUI();
}

// Handle album tap to change album
carousel.addEventListener("click", () => {
    currentAlbumIndex = (currentAlbumIndex + 1) % albums.length;
    currentSongIndex = 0; // Reset to the first song of the new album
    updateUI();
});

// Generate Floating Musical Notes
const musicNotesContainer = document.createElement("div");
musicNotesContainer.id = "music-notes";
document.body.appendChild(musicNotesContainer);

const musicalSymbols = ["♫", "♪", "♬", "♩"];
function generateNotes() {
    const note = document.createElement("div");
    note.className = "note";
    note.textContent = musicalSymbols[Math.floor(Math.random() * musicalSymbols.length)];
    note.style.left = Math.random() * 100 + "vw";
    note.style.fontSize = Math.random() * 20 + 15 + "px"; // Randomize size
    note.style.animationDuration = Math.random() * 3 + 5 + "s"; // Randomize speed
    musicNotesContainer.appendChild(note);

    setTimeout(() => {
        note.remove();
    }, 8000); // Remove notes after animation ends
}

setInterval(generateNotes, 500); // Generate a note every 500ms

//Splash screen js
document.addEventListener("DOMContentLoaded", () => {
    const splashScreen = document.getElementById("splash-screen");
    const enterButton = document.getElementById("enter-button");
    const albumContainer = document.getElementById("album-container");
    const backgroundMusic = document.getElementById("background-music");

    const imagePaths = [
        "AlbumImage/TaylorSwift.png",
        "AlbumImage/Fearless.png",
        "AlbumImage/SpeakNow.png",
        "AlbumImage/Red.png",
        "AlbumImage/1989.png",
        "AlbumImage/Reputation.png",
        "AlbumImage/Lover.png",
        "AlbumImage/Evermore.png",
        "AlbumImage/Folklore.png",
        "AlbumImage/Midnights.png",
    ];

    const topReel = document.getElementById("top-reel");
    const bottomReel = document.getElementById("bottom-reel");

    function populateReel(reel) {
        const reelWidth = window.innerWidth * 2;
        let currentWidth = 0;
    
        while (currentWidth < reelWidth) {
            for (const imagePath of imagePaths) {
                if (currentWidth >= reelWidth) break;
    
                const img = document.createElement("img");
                img.src = imagePath;
                reel.appendChild(img);
                currentWidth += img.width + 10; // Adjust based on margin or padding
            }
        }
    }

    // Populate both reels
    populateReel(topReel);
    populateReel(bottomReel);

    // GSAP Animations for continuous scrolling
    const animationDuration = 5; // Adjust for speed

    gsap.to("#top-reel", {
        x: `-${topReel.scrollWidth / 2}px`, // Half the reel width for smooth looping
        duration: 10, // Adjust to control speed
        repeat: -1,
        ease: "linear",
    });
    
    gsap.to("#bottom-reel", {
        x: `${bottomReel.scrollWidth / 2}px`, // Scroll in the opposite direction
        duration: 10, // Adjust to control speed
        repeat: -1,
        ease: "linear",
    });

    // GSAP animations for splash screen
    gsap.timeline({ delay: 0.5 }) // Delay for page load
        .to(splashScreen, {
            opacity: 1,
            visibility: "visible",
            duration: 1,
            ease: "power3.out",
        })
        .fromTo(
            "#splash-screen h1",
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
        )
        .fromTo(
            "#splash-screen p",
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
            "-=0.5" // Overlap animations
        )
        .fromTo(
            "#enter-button",
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1, ease: "elastic.out(1, 0.5)" },
            "-=0.5"
        );

    enterButton.addEventListener("click", () => {
        // GSAP animation to hide splash screen
        gsap.timeline()
            .to(splashScreen, {
                opacity: 0,
                visibility: "hidden",
                duration: 1.5,
                ease: "power3.inOut",
            })
            .call(() => {
                // Show main content and play background music
                albumContainer.style.display = "block";
                backgroundMusic.play().catch((err) => {
                    console.error("Music playback failed:", err);
                });
            });
    });
});

