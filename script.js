```javascript
/* =========================================================
   🌷 MY PERFECT DAY — GAME ENGINE
   ========================================================= */

const defaultGame = {
  coins: 120,
  mood: 70,
  score: 0,
  tasks: {},
  memories: [],
  achievements: [],
  garden: Array(15).fill(false),
  owned: [],
  journals: [],
  dailyBonus: false,
  look: {
    hair: "brown",
    hairstyle: "long",
    outfit: "pink",
    accessory: "bow",
    skin: "light"
  }
};

let game = JSON.parse(localStorage.getItem("myPerfectDay")) || structuredClone(defaultGame);

function saveGame() {
  localStorage.setItem("myPerfectDay", JSON.stringify(game));
  updateUI();
}

function updateUI() {
  document.getElementById("coins").textContent = game.coins;
  document.getElementById("mood").textContent = game.mood;
  document.getElementById("score").textContent = game.score;

  document.getElementById("homeMood").textContent = `${game.mood} / 100`;
  document.getElementById("homeScore").textContent = `${game.score} points`;

  const completed = Object.values(game.tasks).filter(Boolean).length;
  document.getElementById("taskCount").textContent = `${Math.min(completed, 6)} / 6`;

  document.getElementById("moodBar").style.width = `${game.mood}%`;
  document.getElementById("scoreBar").style.width =
    `${Math.min(game.score / 2, 100)}%`;
  document.getElementById("taskBar").style.width =
    `${Math.min((completed / 6) * 100, 100)}%`;

  renderAchievements();
  renderAlbum();
  renderJournal();
  renderGarden();
  renderShop();
}

function toast(message) {
  const box = document.getElementById("toast");

  box.textContent = message;
  box.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    box.classList.remove("show");
  }, 2200);
}

function addReward(coins = 0, mood = 0, score = 0) {
  game.coins += coins;
  game.mood = Math.max(0, Math.min(100, game.mood + mood));
  game.score += score;

  saveGame();
}


/* =========================================================
   🌸 NAVIGATION
   ========================================================= */

const navButtons = document.querySelectorAll(".nav");
const pages = document.querySelectorAll(".page");

function openPage(pageName) {
  pages.forEach(page => page.classList.remove("active"));
  navButtons.forEach(button => button.classList.remove("active"));

  const page = document.getElementById(pageName);
  const nav = document.querySelector(`.nav[data-page="${pageName}"]`);

  if (page) page.classList.add("active");
  if (nav) nav.classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    openPage(button.dataset.page);
  });
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    openPage(button.dataset.go);
  });
});


/* =========================================================
   🌅 MORNING / ACTIVITIES
   ========================================================= */

document.querySelectorAll(".activity").forEach(button => {

  button.addEventListener("click", () => {

    const name = button.dataset.name;

    if (game.tasks[name]) {
      toast("You already completed this ✨");
      return;
    }

    game.tasks[name] = true;

    const mood = Number(button.dataset.mood || 0);
    const score = Number(button.dataset.score || 0);

    addReward(5, mood, score);

    addMemory(
      "🌷",
      name,
      "A tiny moment from your perfect day."
    );

    button.classList.add("completed");

    toast(`✨ ${name} completed! +5 🪙`);

    checkAchievements();
  });

});


/* =========================================================
   👗 CHARACTER CUSTOMIZATION
   ========================================================= */

const character = document.getElementById("character");

function updateCharacter() {

  if (!character) return;

  character.classList.remove(
    "hair-brown",
    "hair-chestnut",
    "hair-lavender",
    "hair-pink",
    "style-long",
    "style-bob",
    "style-pigtails",
    "outfit-pink",
    "outfit-purple",
    "outfit-cream",
    "outfit-berry",
    "skin-light",
    "skin-warm",
    "skin-peach"
  );

  character.classList.add(`hair-${game.look.hair}`);
  character.classList.add(`style-${game.look.hairstyle}`);
  character.classList.add(`outfit-${game.look.outfit}`);
  character.classList.add(`skin-${game.look.skin}`);

  const accessory = document.getElementById("accessory");

  const icons = {
    bow: "🎀",
    crown: "👑",
    flower: "🌸",
    none: ""
  };

  accessory.textContent = icons[game.look.accessory] || "";
}

const hairColor = document.getElementById("hairColor");
const hairStyle = document.getElementById("hairStyle");
const outfit = document.getElementById("outfit");
const accessorySelect = document.getElementById("accessorySelect");
const skinTone = document.getElementById("skinTone");

if (hairColor) {
  hairColor.addEventListener("change", e => {
    game.look.hair = e.target.value;
    updateCharacter();
    saveGame();
  });
}

if (hairStyle) {
  hairStyle.addEventListener("change", e => {
    game.look.hairstyle = e.target.value;
    updateCharacter();
    saveGame();
  });
}

if (outfit) {
  outfit.addEventListener("change", e => {
    game.look.outfit = e.target.value;
    updateCharacter();
    saveGame();
  });
}

if (accessorySelect) {
  accessorySelect.addEventListener("change", e => {
    game.look.accessory = e.target.value;
    updateCharacter();
    saveGame();
  });
}

if (skinTone) {
  skinTone.addEventListener("change", e => {
    game.look.skin = e.target.value;
    updateCharacter();
    saveGame();
  });
}

document.getElementById("saveLook")?.addEventListener("click", () => {

  addReward(15, 5, 20);

  addMemory(
    "👗",
    "New Look",
    "You created a new outfit in the dress-up studio!"
  );

  toast("🎀 Look saved! +15 🪙");

  confetti();
  checkAchievements();
});


/* =========================================================
   ☕ CAFÉ
   ========================================================= */

document.querySelectorAll(".cafe-item").forEach(item => {

  item.addEventListener("click", () => {

    const cost = Number(item.dataset.cost);
    const reward = Number(item.dataset.reward);
    const name = item.dataset.name;

    if (game.coins < cost) {
      toast("Not enough coins 🪙");
      return;
    }

    game.coins -= cost;

    game.coins += reward;

    game.mood = Math.min(100, game.mood + 8);
    game.score += 15;

    addMemory(
      "☕",
      name,
      `You made ${name} at your cozy café.`
    );

    saveGame();

    toast(`☕ ${name}! +${reward - cost} 🪙`);

    checkAchievements();
  });

});


/* =========================================================
   🍳 COOKING
   ========================================================= */

const recipes = {

  cupcake: {
    name: "Vanilla Cupcakes",
    icon: "🧁",
    steps: [
      "🥣 Mix the ingredients",
      "🧁 Fill the cupcake cups",
      "🔥 Bake until fluffy"
    ]
  },

  tart: {
    name: "Strawberry Tart",
    icon: "🍓",
    steps: [
      "🥧 Prepare the pastry",
      "🍓 Add strawberries",
      "✨ Add the finishing touch"
    ]
  },

  pancakes: {
    name: "Cloud Pancakes",
    icon: "🥞",
    steps: [
      "🥣 Mix the batter",
      "🍳 Cook the pancakes",
      "🍓 Add toppings"
    ]
  }

};

let currentRecipe = null;
let recipeStep = 0;

document.querySelectorAll(".recipe").forEach(button => {

  button.addEventListener("click", () => {

    currentRecipe = recipes[button.dataset.recipe];
    recipeStep = 0;

    showRecipeStep();

  });

});

function showRecipeStep() {

  const box = document.getElementById("recipeSteps");

  if (!currentRecipe) return;

  if (recipeStep >= currentRecipe.steps.length) {

    box.innerHTML = `
      <div class="card">
        <h2>${currentRecipe.icon} ${currentRecipe.name} is ready!</h2>
        <p>Perfect! You made something delicious. ✨</p>
      </div>
    `;

    addReward(20, 12, 25);

    addMemory(
      currentRecipe.icon,
      currentRecipe.name,
      "A delicious recipe you made yourself."
    );

    toast("🍳 Recipe complete! +20 🪙");

    checkAchievements();

    return;
  }

  box.innerHTML = `
    <div class="card">
      <h2>${currentRecipe.icon} ${currentRecipe.name}</h2>

      <p class="recipe-progress">
        Step ${recipeStep + 1} of ${currentRecipe.steps.length}
      </p>

      <button class="recipe-step" id="nextRecipe">
        ${currentRecipe.steps[recipeStep]}
      </button>
    </div>
  `;

  document.getElementById("nextRecipe").onclick = () => {

    recipeStep++;

    showRecipeStep();

  };

}


/* =========================================================
   🎨 ART STUDIO
   ========================================================= */

const canvas = document.getElementById("canvas");
const ctx = canvas?.getContext("2d");

let drawing = false;
let currentColor = "#d991b5";

const artColors = [
  "#f4b6d2",
  "#c9b7ec",
  "#a88bd0",
  "#f7d9b7",
  "#a9d9d0",
  "#d9a9d0",
  "#70505f",
  "#ffffff"
];

const colorBox = document.getElementById("colors");

if (colorBox) {

  artColors.forEach(color => {

    const button = document.createElement("button");

    button.className = "color-button";
    button.style.background = color;

    button.addEventListener("click", () => {
      currentColor = color;
    });

    colorBox.appendChild(button);

  });

}

function draw(e) {

  if (!drawing || !ctx) return;

  const rect = canvas.getBoundingClientRect();

  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);

  ctx.fillStyle = currentColor;

  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();
}

if (canvas) {

  canvas.addEventListener("pointerdown", e => {
    drawing = true;
    draw(e);
  });

  canvas.addEventListener("pointermove", draw);

  canvas.addEventListener("pointerup", () => {
    drawing = false;
  });

  canvas.addEventListener("pointerleave", () => {
    drawing = false;
  });

}

document.getElementById("clearCanvas")?.addEventListener("click", () => {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  toast("Canvas cleared ✨");

});


const prompts = [
  "Draw your dream café ☕",
  "Draw a magical garden 🌷",
  "Draw your perfect bedroom 🛏️",
  "Draw a cute pet 🐰",
  "Draw your dream vacation 🏖️",
  "Draw a magical outfit 👗",
  "Draw a picnic under the stars ✨",
  "Draw a tiny fairy house 🧚"
];

function newPrompt() {

  const prompt =
    prompts[Math.floor(Math.random() * prompts.length)];

  document.getElementById("artPrompt").textContent = prompt;
}

document.getElementById("newPrompt")?.addEventListener("click", newPrompt);

document.getElementById("saveArt")?.addEventListener("click", () => {

  addReward(25, 10, 30);

  addMemory(
    "🎨",
    "Artwork Created",
    "You made a little masterpiece in the art studio."
  );

  toast("🎨 Artwork saved! +25 🪙");

  checkAchievements();

});

newPrompt();


/* =========================================================
   📚 STUDY TIMER
   ========================================================= */

let timerSeconds = 300;
let timerInterval = null;

function updateTimer() {

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  document.getElementById("timer").textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}

document.getElementById("startTimer")?.addEventListener("click", () => {

  if (timerInterval) return;

  toast("📚 Focus time started!");

  timerInterval = setInterval(() => {

    timerSeconds--;

    updateTimer();

    if (timerSeconds <= 0) {

      clearInterval(timerInterval);
      timerInterval = null;

      addReward(15, 8, 25);

      addMemory(
        "📚",
        "Focus Session",
        "You completed a focused study session."
      );

      toast("📚 Focus complete! +15 🪙");

      confetti();

      timerSeconds = 300;
      updateTimer();

      checkAchievements();

    }

  }, 1000);

});

document.getElementById("resetTimer")?.addEventListener("click", () => {

  clearInterval(timerInterval);

  timerInterval = null;

  timerSeconds = 300;

  updateTimer();

});


/* =========================================================
   🎵 MUSIC ROOM
   ========================================================= */

document.querySelectorAll(".music-button").forEach(button => {

  button.addEventListener("click", () => {

    const track = button.dataset.track;

    document.getElementById("currentTrack").textContent =
      `Now playing: ${track}`;

    game.mood = Math.min(100, game.mood + 5);
    game.score += 5;

    saveGame();

    toast(`🎵 ${track}`);

  });

});

document.getElementById("stopMusic")?.addEventListener("click", () => {

  document.getElementById("currentTrack").textContent =
    "Nothing playing";

});


/* =========================================================
   🌳 GARDEN
   ========================================================= */

function renderGarden() {

  const grid = document.getElementById("gardenGrid");

  if (!grid) return;

  grid.innerHTML = "";

  game.garden.forEach((grown, index) => {

    const plot = document.createElement("button");

    plot.className = `garden-plot ${grown ? "grown" : ""}`;

    plot.textContent = grown ? "🌷" : "🌱";

    plot.title = grown
      ? "A flower is growing here!"
      : "Click to plant";

    plot.addEventListener("click", () => {

      if (game.garden[index]) {
        toast("This flower is already growing 🌷");
        return;
      }

      game.garden[index] = true;

      addReward(3, 4, 8);

      toast("🌱 You planted a flower!");

      checkAchievements();

    });

    grid.appendChild(plot);

  });

}

document.getElementById("waterGarden")?.addEventListener("click", () => {

  const grown = game.garden.filter(Boolean).length;

  if (grown === 0) {
    toast("Plant some flowers first 🌱");
    return;
  }

  addReward(5, 8, 20);

  toast("💧 Your garden is sparkling!");

  checkAchievements();

});


/* =========================================================
   🐾 PETS
   ========================================================= */

document.querySelectorAll(".pet").forEach(button => {

  button.addEventListener("click", () => {

    const pet = button.dataset.pet;

    addReward(5, 10, 12);

    addMemory(
      "🐾",
      `Time with ${pet}`,
      `You spent some lovely time with your ${pet}.`
    );

    toast(`🐾 ${pet} is happy!`);

    checkAchievements();

  });

});


/* =========================================================
   🛍️ SHOP
   ========================================================= */

const shopItems = [

  {
    id: "pink-bow",
    icon: "🎀",
    name: "Silky Pink Bow",
    price: 30
  },

  {
    id: "flower-crown",
    icon: "🌸",
    name: "Flower Crown",
    price: 45
  },

  {
    id: "purple-bag",
    icon: "👜",
    name: "Lavender Bag",
    price: 60
  },

  {
    id: "fairy-wings",
    icon: "🧚",
    name: "Fairy Wings",
    price: 80
  },

  {
    id: "cake-display",
    icon: "🍰",
    name: "Café Cake Display",
    price: 55
  },

  {
    id: "pink-lamp",
    icon: "🏮",
    name: "Pastel Lamp",
    price: 35
  },

  {
    id: "teddy",
    icon: "🧸",
    name: "Tiny Teddy",
    price: 50
  },

  {
    id: "magic-wand",
    icon: "🪄",
    name: "Magic Wand",
    price: 100
  }

];

function renderShop() {

  const shop = document.getElementById("shopGrid");

  if (!shop) return;

  shop.innerHTML = "";

  shopItems.forEach(item => {

    const owned = game.owned.includes(item.id);

    const card = document.createElement("div");

    card.className = "shop-item";

    card.innerHTML = `
      <div class="item-icon">${item.icon}</div>
      <h2>${item.name}</h2>
      <p>${item.price} 🪙</p>
      <button class="${owned ? "secondary" : "primary"}">
        ${owned ? "Owned ✓" : "Buy"}
      </button>
    `;

    const button = card.querySelector("button");

    button.addEventListener("click", () => {

      if (owned) {
        toast("You already own this ✨");
        return;
      }

      if (game.coins < item.price) {
        toast("You need more coins 🪙");
        return;
      }

      game.coins -= item.price;
      game.owned.push(item.id);

      game.score += 10;

      addMemory(
        item.icon,
        "New Item!",
        `You bought ${item.name}.`
      );

      saveGame();

      toast(`${item.icon} ${item.name} unlocked!`);

      checkAchievements();

    });

    shop.appendChild(card);

  });

}


/* =========================================================
   🏖️ TRAVEL
   ========================================================= */

document.querySelectorAll(".travel").forEach(button => {

  button.addEventListener("click", () => {

    const cost = Number(button.dataset.cost);
    const place = button.dataset.place;

    if (game.coins < cost) {
      toast("You need more coins for this trip 🪙");
      return;
    }

    game.coins -= cost;
    game.mood = Math.min(100, game.mood + 20);
    game.score += 30;

    addMemory(
      "🏖️",
      `Trip to ${place}`,
      `You visited ${place} during your perfect day.`
    );

    saveGame();

    toast(`🏖️ Welcome to ${place}!`);

    confetti();

    checkAchievements();

  });

});


/* =========================================================
   📸 MEMORIES
   ========================================================= */

function addMemory(icon, title, text) {

  game.memories.unshift({
    icon,
    title,
    text,
    date: new Date().toLocaleDateString()
  });

  if (game.memories.length > 30) {
    game.memories.pop();
  }

  saveGame();

}

function renderAlbum() {

  const album = document.getElementById("album");

  if (!album) return;

  if (game.memories.length === 0) {

    album.innerHTML = `
      <div class="card">
        <h2>📸 Your album is waiting...</h2>
        <p>Complete activities to create your first memory!</p>
      </div>
    `;

    return;
  }

  album.innerHTML = game.memories.map(memory => `

    <div class="memory-card">

      <div class="memory-icon">
        ${memory.icon}
      </div>

      <h2>${memory.title}</h2>

      <p>${memory.text}</p>

      <small>${memory.date}</small>

    </div>

  `).join("");

}


/* =========================================================
   💌 JOURNAL
   ========================================================= */

function renderJournal() {

  const box = document.getElementById("journalEntries");

  if (!box) return;

  if (game.journals.length === 0) {

    box.innerHTML =
      "<p>Your journal is empty. Write your first entry! 💌</p>";

    return;
  }

  box.innerHTML = game.journals.map(entry => `

    <div class="journal-entry">

      <h2>${escapeHTML(entry.title)}</h2>

      <p>${escapeHTML(entry.text)}</p>

      <small>${entry.date}</small>

    </div>

  `).join("");

}

document.getElementById("saveJournal")?.addEventListener("click", () => {

  const title = document.getElementById("journalTitle").value.trim();
  const text = document.getElementById("journalText").value.trim();

  if (!title || !text) {

    toast("Write something first 💌");

    return;

  }

  game.journals.unshift({
    title,
    text,
    date: new Date().toLocaleDateString()
  });

  document.getElementById("journalTitle").value = "";
  document.getElementById("journalText").value = "";

  addReward(10, 6, 15);

  addMemory(
    "💌",
    "Journal Entry",
    "You wrote something in your little diary."
  );

  toast("💌 Journal entry saved!");

  checkAchievements();

});

function escapeHTML(text) {

  const div = document.createElement("div");
  div.textContent = text;

  return div.innerHTML;

}


/* =========================================================
   🍓 MINI GAME 1 — STRAWBERRY CATCH
   ========================================================= */

let berryRunning = false;
let berryCaught = 0;
let berryInterval = null;

document.getElementById("startBerry")?.addEventListener("click", () => {

  if (berryRunning) return;

  berryRunning = true;
  berryCaught = 0;

  document.getElementById("berryScore").textContent = "0 / 10";

  const board = document.getElementById("berryBoard");

  board.innerHTML = "";

  berryInterval = setInterval(() => {

    if (berryCaught >= 10) {

      clearInterval(berryInterval);
      berryRunning = false;

      addReward(40, 12, 50);

      toast("🍓 You caught them all! +40 🪙");

      confetti();

      checkAchievements();

      return;
    }

    spawnBerry();

  }, 700);

});

function spawnBerry() {

  const board = document.getElementById("berryBoard");

  const berry = document.createElement("button");

  berry.className = "falling-item";
  berry.textContent = "🍓";

  berry.style.left =
    `${Math.random() * 88 + 4}%`;

  berry.style.top =
    `${Math.random() * 78 + 5}%`;

  berry.addEventListener("click", () => {

    berryCaught++;

    document.getElementById("berryScore").textContent =
      `${berryCaught} / 10`;

    berry.remove();

  });

  board.appendChild(berry);

  setTimeout(() => {

    if (berry.isConnected) {
      berry.remove();
    }

  }, 1300);

}


/* =========================================================
   🧁 MINI GAME 2 — MEMORY MATCH
   ========================================================= */

const memoryIcons = [
  "🧁",
  "🍓",
  "🌸",
  "☕",
  "🐰",
  "🎀",
  "🍰",
  "✨"
];

let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let memoryLocked = false;

document.getElementById("startMemory")?.addEventListener("click", startMemory);

function startMemory() {

  const board = document.getElementById("memoryBoard");

  board.innerHTML = "";

  memoryCards = [...memoryIcons, ...memoryIcons]
    .sort(() => Math.random() - .5);

  flippedCards = [];
  matchedPairs = 0;
  memoryLocked = false;

  memoryCards.forEach((icon, index) => {

    const tile = document.createElement("button");

    tile.className = "memory-tile";
    tile.dataset.icon = icon;
    tile.dataset.index = index;

    tile.textContent = icon;

    tile.addEventListener("click", () => {

      if (
        memoryLocked ||
        tile.classList.contains("flipped") ||
        tile.classList.contains("matched")
      ) return;

      tile.classList.add("flipped");

      flippedCards.push(tile);

      if (flippedCards.length === 2) {

        memoryLocked = true;

        const [first, second] = flippedCards;

        if (first.dataset.icon === second.dataset.icon) {

          first.classList.add("matched");
          second.classList.add("matched");

          matchedPairs++;

          flippedCards = [];
          memoryLocked = false;

          if (matchedPairs === memoryIcons.length) {

            addReward(50, 15, 60);

            addMemory(
              "🧁",
              "Memory Match Champion",
              "You matched every card!"
            );

            toast("🧁 Perfect match! +50 🪙");

            confetti();

            checkAchievements();

          }

        } else {

          setTimeout(() => {

            first.classList.remove("flipped");
            second.classList.remove("flipped");

            flippedCards = [];
            memoryLocked = false;

          }, 700);

        }

      }

    });

    board.appendChild(tile);

  });

}


/* =========================================================
   ✨ MINI GAME 3 — STAR CATCHER
   ========================================================= */

let starsRunning = false;
let starsCaught = 0;
let starTimer = null;

document.getElementById("startStars")?.addEventListener("click", () => {

  if (starsRunning) return;

  starsRunning = true;
  starsCaught = 0;

  document.getElementById("starScore").textContent = "0";

  const board = document.getElementById("starBoard");

  board.innerHTML = "";

  let time = 20;

  starTimer = setInterval(() => {

    time--;

    spawnStar();

    if (time <= 0) {

      clearInterval(starTimer);
      starsRunning = false;

      const reward = Math.min(60, starsCaught * 5);

      addReward(
        reward,
        Math.min(20, starsCaught),
        starsCaught * 3
      );

      toast(`✨ You caught ${starsCaught} stars! +${reward} 🪙`);

      if (starsCaught >= 10) {
        confetti();
      }

      checkAchievements();

    }

  }, 800);

});

function spawnStar() {

  const board = document.getElementById("starBoard");

  const star = document.createElement("button");

  star.className = "falling-item";
  star.textContent = "⭐";

  star.style.left =
    `${Math.random() * 88 + 4}%`;

  star.style.top =
    `${Math.random() * 78 + 5}%`;

  star.addEventListener("click", () => {

    starsCaught++;

    document.getElementById("starScore").textContent =
      starsCaught;

    star.remove();

  });

  board.appendChild(star);

  setTimeout(() => {

    if (star.isConnected) {
      star.remove();
    }

  }, 1000);

}


/* =========================================================
   🏆 ACHIEVEMENTS
   ========================================================= */

const achievements = [

  {
    id: "first",
    icon: "🌷",
    title: "First Little Step",
    description: "Complete your first activity.",
    check: () => game.score >= 1
  },

  {
    id: "coins",
    icon: "🪙",
    title: "Coin Collector",
    description: "Have 250 coins.",
    check: () => game.coins >= 250
  },

  {
    id: "happy",
    icon: "💗",
    title: "Happy Heart",
    description: "Reach 100 mood.",
    check: () => game.mood >= 100
  },

  {
    id: "artist",
    icon: "🎨",
    title: "Little Artist",
    description: "Create artwork.",
    check: () => game.memories.some(m => m.icon === "🎨")
  },

  {
    id: "chef",
    icon: "🧁",
    title: "Tiny Chef",
    description: "Complete a recipe.",
    check: () => game.memories.some(m => m.icon === "🧁")
  },

  {
    id: "traveler",
    icon: "🏖️",
    title: "Dreamy Traveler",
    description: "Visit a destination.",
    check: () => game.memories.some(m => m.icon === "🏖️")
  },

  {
    id: "gardener",
    icon: "🌱",
    title: "Little Gardener",
    description: "Grow five flowers.",
    check: () => game.garden.filter(Boolean).length >= 5
  },

  {
    id: "journal",
    icon: "💌",
    title: "Dear Diary",
    description: "Write a journal entry.",
    check: () => game.journals.length >= 1
  },

  {
    id: "shopper",
    icon: "🛍️",
    title: "Pastel Shopper",
    description: "Own three shop items.",
    check: () => game.owned.length >= 3
  },

  {
    id: "perfect",
    icon: "👑",
    title: "Perfect Day",
    description: "Reach 500 Perfect Day points.",
    check: () => game.score >= 500
  }

];

function renderAchievements() {

  const grid = document.getElementById("achievementGrid");

  if (!grid) return;

  grid.innerHTML = "";

  achievements.forEach(achievement => {

    const unlocked = achievement.check();

    const card = document.createElement("div");

    card.className =
      `achievement ${unlocked ? "unlocked" : ""}`;

    card.innerHTML = `

      <div class="achievement-icon">
        ${achievement.icon}
      </div>

      <h2>${achievement.title}</h2>

      <p>${achievement.description}</p>

      <small>
        ${unlocked ? "✨ UNLOCKED" : "🔒 LOCKED"}
      </small>

    `;

    grid.appendChild(card);

  });

}

function checkAchievements() {

  let newAchievement = false;

  achievements.forEach(achievement => {

    if (
      achievement.check() &&
      !game.achievements.includes(achievement.id)
    ) {

      game.achievements.push(achievement.id);

      newAchievement = true;

      toast(`🏆 Achievement: ${achievement.title}`);

    }

  });

  if (newAchievement) {

    game.coins += 20;
    game.score += 15;

    saveGame();

  }

}


/* =========================================================
   🎁 DAILY BONUS
   ========================================================= */

document.getElementById("dailyBonus")?.addEventListener("click", () => {

  if (game.dailyBonus) {

    toast("You already collected today's bonus 🎁");

    return;

  }

  game.dailyBonus = true;

  addReward(30, 10, 20);

  toast("🎁 Daily bonus collected! +30 🪙");

  confetti();

});


/* =========================================================
   🌙 DARK MODE
   ========================================================= */

document.getElementById("themeButton")?.addEventListener("click", () => {

  document.body.classList.toggle("dark");

  const dark = document.body.classList.contains("dark");

  document.getElementById("themeButton").textContent =
    dark ? "☀️" : "🌙";

  localStorage.setItem(
    "perfectDayDarkMode",
    dark
  );

});

if (localStorage.getItem("perfectDayDarkMode") === "true") {

  document.body.classList.add("dark");

  document.getElementById("themeButton").textContent = "☀️";

}


/* =========================================================
   💾 RESET
   ========================================================= */

document.getElementById("resetGame")?.addEventListener("click", () => {

  const confirmed = confirm(
    "Are you sure you want to reset your Perfect Day?"
  );

  if (!confirmed) return;

  game = structuredClone(defaultGame);

  saveGame();

  updateCharacter();

  toast("Everything has been reset 🌷");

});


/* =========================================================
   📦 EXPORT SAVE
   ========================================================= */

document.getElementById("exportSave")?.addEventListener("click", () => {

  const data = JSON.stringify(game, null, 2);

  const blob = new Blob(
    [data],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "my-perfect-day-save.json";

  link.click();

  URL.revokeObjectURL(url);

  toast("💾 Save exported!");

});


/* =========================================================
   🎉 CONFETTI
   ========================================================= */

function confetti() {

  const icons = [
    "🌸",
    "✨",
    "💗",
    "🎀",
    "⭐",
    "🌷",
    "💜"
  ];

  for (let i = 0; i < 25; i++) {

    const piece = document.createElement("div");

    piece.className = "confetti";

    piece.textContent =
      icons[Math.floor(Math.random() * icons.length)];

    piece.style.left =
      `${Math.random() * 100}%`;

    piece.style.animationDelay =
      `${Math.random() * .8}s`;

    document.body.appendChild(piece);

    setTimeout(() => {
      piece.remove();
    }, 3000);

  }

}


/* =========================================================
   📅 DATE
   ========================================================= */

const dateElement = document.getElementById("today");

if (dateElement) {

  dateElement.textContent =
    new Date().toLocaleDateString(
      undefined,
      {
        weekday: "long",
        month: "short",
        day: "numeric"
      }
    );

}


/* =========================================================
   🌷 INITIALIZE
   ========================================================= */

function initialize() {

  updateUI();

  updateCharacter();

  if (hairColor)
    hairColor.value = game.look.hair;

  if (hairStyle)
    hairStyle.value = game.look.hairstyle;

  if (outfit)
    outfit.value = game.look.outfit;

  if (accessorySelect)
    accessorySelect.value = game.look.accessory;

  if (skinTone)
    skinTone.value = game.look.skin;

  updateTimer();

  checkAchievements();

}

initialize();
```
