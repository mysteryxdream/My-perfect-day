```javascript
/* =========================================================
   MY PERFECT DAY 🌷
   Complete Game Controller
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     ELEMENTS
     ========================= */

  const player = document.getElementById("player");
  const map = document.getElementById("map");

  const coinsDisplay = document.getElementById("coins");
  const moodDisplay = document.getElementById("mood");
  const scoreDisplay = document.getElementById("score");

  const interaction = document.getElementById("interaction");
  const interactionText = document.getElementById("interactionText");

  const startScreen = document.getElementById("startScreen");
  const startGame = document.getElementById("startGame");

  const dialogue = document.getElementById("dialogue");
  const dialogueName = document.getElementById("dialogueName");
  const dialogueText = document.getElementById("dialogueText");
  const dialogueNext = document.getElementById("dialogueNext");

  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalIcon = document.getElementById("modalIcon");
  const modalDescription = document.getElementById("modalDescription");
  const activityContent = document.getElementById("activityContent");
  const activityButton = document.getElementById("activityButton");
  const closeModal = document.getElementById("closeModal");

  const miniGame = document.getElementById("miniGame");
  const miniGameArea = document.getElementById("miniGameArea");
  const miniScoreDisplay = document.getElementById("miniScore");
  const closeMiniGame = document.getElementById("closeMiniGame");

  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");


  /* =========================
     GAME STATE
     ========================= */

  let gameStarted = false;

  let coins = Number(localStorage.getItem("perfectDayCoins")) || 0;
  let mood = Number(localStorage.getItem("perfectDayMood")) || 70;
  let score = Number(localStorage.getItem("perfectDayScore")) || 0;

  let completed = JSON.parse(
    localStorage.getItem("perfectDayCompleted") || "[]"
  );

  let keys = {};

  let playerX = 650;
  let playerY = 390;

  const speed = 4;

  let currentAction = null;

  let dialogueLines = [];
  let dialogueIndex = 0;

  let miniScore = 0;
  let miniTimer = null;

  const MAP_WIDTH = 1400;
  const MAP_HEIGHT = 850;

  const PLAYER_WIDTH = 70;
  const PLAYER_HEIGHT = 105;


  /* =========================
     INITIAL UI
     ========================= */

  updateStats();
  updateProgress();


  /* =========================
     START GAME
     ========================= */

  startGame.addEventListener("click", () => {

    gameStarted = true;

    startScreen.classList.add("hidden");

    showDialogue(
      "My Perfect Day",
      [
        "Good morning! 🌷",
        "Today is your perfect day.",
        "Explore the little world and discover activities.",
        "Use WASD or the arrow keys to move around.",
        "Walk near something and press E to interact! ✨"
      ]
    );

  });


  /* =========================
     KEYBOARD
     ========================= */

  document.addEventListener("keydown", (event) => {

    const key = event.key.toLowerCase();

    keys[key] = true;

    if (
      ["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)
    ) {
      event.preventDefault();
    }

    if (key === "e" && gameStarted) {
      interact();
    }

    if (key === "escape") {
      closeAll();
    }

  });


  document.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
  });


  /* =========================
     GAME LOOP
     ========================= */

  function gameLoop() {

    if (gameStarted && !isBlocked()) {
      movePlayer();
    }

    requestAnimationFrame(gameLoop);
  }

  gameLoop();


  /* =========================
     MOVEMENT
     ========================= */

  function movePlayer() {

    let moving = false;

    if (keys["arrowup"] || keys["w"]) {
      playerY -= speed;
      moving = true;
    }

    if (keys["arrowdown"] || keys["s"]) {
      playerY += speed;
      moving = true;
    }

    if (keys["arrowleft"] || keys["a"]) {
      playerX -= speed;
      moving = true;
    }

    if (keys["arrowright"] || keys["d"]) {
      playerX += speed;
      moving = true;
    }

    /* Keep player inside world */

    playerX = Math.max(
      20,
      Math.min(MAP_WIDTH - PLAYER_WIDTH, playerX)
    );

    playerY = Math.max(
      100,
      Math.min(MAP_HEIGHT - PLAYER_HEIGHT, playerY)
    );

    player.style.left = playerX + "px";
    player.style.top = playerY + "px";

    if (moving) {
      player.classList.add("walking");
    } else {
      player.classList.remove("walking");
    }

    updateCamera();
    checkNearby();
  }


  /* =========================
     CAMERA
     ========================= */

  function updateCamera() {

    const worldWidth = window.innerWidth;
    const worldHeight = window.innerHeight - 72;

    let cameraX = -(playerX - worldWidth / 2);
    let cameraY = -(playerY - worldHeight / 2);

    const minX = -(MAP_WIDTH - worldWidth);
    const minY = -(MAP_HEIGHT - worldHeight);

    cameraX = Math.min(0, Math.max(minX, cameraX));
    cameraY = Math.min(0, Math.max(minY, cameraY));

    map.style.transform =
      `translate(${cameraX}px, ${cameraY}px)`;
  }


  /* =========================
     INTERACTION CHECK
     ========================= */

  function checkNearby() {

    if (!gameStarted) return;

    const objects = [
      ...document.querySelectorAll(".location"),
      document.getElementById("pet"),
      ...document.querySelectorAll(".coin")
    ];

    let nearest = null;
    let nearestDistance = Infinity;

    objects.forEach(object => {

      if (object.classList.contains("collected")) return;

      const x = parseFloat(object.style.left || object.offsetLeft);
      const y = parseFloat(object.style.top || object.offsetTop);

      const centerX = x + object.offsetWidth / 2;
      const centerY = y + object.offsetHeight / 2;

      const playerCenterX =
        playerX + PLAYER_WIDTH / 2;

      const playerCenterY =
        playerY + PLAYER_HEIGHT / 2;

      const distance = Math.sqrt(
        Math.pow(centerX - playerCenterX, 2) +
        Math.pow(centerY - playerCenterY, 2)
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = object;
      }

    });


    if (nearest && nearestDistance < 125) {

      interaction.classList.add("near");

      if (nearest.classList.contains("coin")) {

        interactionText.textContent =
          "🪙 Press E to collect the coin!";

        currentAction = {
          type: "coin",
          object: nearest
        };

      } else {

        const name =
          nearest.dataset.name || "this";

        interactionText.textContent =
          `✨ Press E to interact with ${name}!`;

        currentAction = {
          type: "action",
          action: nearest.dataset.action
        };

      }

    } else {

      interaction.classList.remove("near");

      interactionText.textContent =
        "Use WASD or arrow keys to explore ✨";

      currentAction = null;
    }

  }


  /* =========================
     INTERACT
     ========================= */

  function interact() {

    if (!currentAction) return;

    if (currentAction.type === "coin") {

      collectCoin(currentAction.object);

      return;
    }

    runAction(currentAction.action);
  }


  /* =========================
     COLLECT COIN
     ========================= */

  function collectCoin(coin) {

    coin.classList.add("collected");

    coin.style.pointerEvents = "none";

    coin.animate(
      [
        {
          transform: "scale(1)",
          opacity: 1
        },
        {
          transform: "scale(1.8) translateY(-25px)",
          opacity: 0
        }
      ],
      {
        duration: 450,
        easing: "ease-out"
      }
    );

    setTimeout(() => {
      coin.style.display = "none";
    }, 430);

    coins += 10;
    score += 5;
    mood = Math.min(100, mood + 2);

    saveGame();
    updateStats();

    showFloatingText("+10 🪙");
  }


  /* =========================
     ACTIONS
     ========================= */

  function runAction(action) {

    switch (action) {

      case "bedroom":
        openBedroom();
        break;

      case "cafe":
        openCafe();
        break;

      case "kitchen":
        openKitchen();
        break;

      case "studio":
        openStudio();
        break;

      case "garden":
        openGarden();
        break;

      case "shop":
        openShop();
        break;

      case "study":
        openStudy();
        break;

      case "pet":
        petInteraction();
        break;

      default:
        break;
    }

  }


  /* =========================
     BEDROOM
     ========================= */

  function openBedroom() {

    openModal(
      "🛏️",
      "Good Morning!",
      "Start your day by getting ready.",
      "Get Ready ✨",
      () => {

        completeActivity(
          "morning",
          15,
          5
        );

        showDialogue(
          "Morning",
          [
            "You got ready for the day! 🎀",
            "Your perfect day has officially started."
          ]
        );

      }
    );

  }


  /* =========================
     CAFE
     ========================= */

  function openCafe() {

    openModal(
      "☕",
      "Cozy Café",
      "Make yourself a cute café drink!",
      "Make Drink ☕",
      () => {

        completeActivity(
          "cafe",
          20,
          7
        );

        showDialogue(
          "Café",
          [
            "Your drink is ready! ☕💕",
            "That was the perfect little café break."
          ]
        );

      }
    );

  }


  /* =========================
     KITCHEN
     ========================= */

  function openKitchen() {

    openModal(
      "🍳",
      "Little Kitchen",
      "Prepare breakfast by choosing the ingredients.",
      "Cook Breakfast 🍳",
      () => {

        const ingredients = [
          "🥚 Egg",
          "🍓 Strawberry",
          "🥞 Pancake",
          "🥛 Milk"
        ];

        activityContent.innerHTML = `
          <div style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:12px;
            margin-top:20px;
          ">
            ${ingredients.map((item, index) => `
              <button
                class="ingredient"
                data-index="${index}"
                style="
                  padding:18px;
                  border:3px solid #ead8ec;
                  border-radius:18px;
                  background:#fff;
                  font-size:16px;
                  font-weight:800;
                  cursor:pointer;
                ">
                ${item}
              </button>
            `).join("")}
          </div>
        `;

        activityButton.textContent = "Finish Cooking ✨";

        let selected = 0;

        document.querySelectorAll(".ingredient")
          .forEach(button => {

            button.addEventListener("click", () => {

              if (!button.classList.contains("selected")) {

                button.classList.add("selected");

                button.style.background = "#f9dceb";

                selected++;

              }

            });

          });

        activityButton.onclick = () => {

          if (selected < 2) {

            alert("Choose at least two ingredients! 🍓");

            return;
          }

          completeActivity(
            "kitchen",
            25,
            8
          );

          closeModal();

          showDialogue(
            "Kitchen",
            [
              "Breakfast is ready! 🥞💕",
              "You made something delicious."
            ]
          );

        };

      }
    );

  }


  /* =========================
     ART STUDIO
     ========================= */

  function openStudio() {

    openModal(
      "🎨",
      "Art Studio",
      "Create a tiny masterpiece!",
      "Open Art Studio 🎨",
      () => {

        activityContent.innerHTML = `
          <canvas
            id="drawingCanvas"
            width="500"
            height="260"
            style="
              width:100%;
              max-width:500px;
              background:#fff;
              border:3px solid #ead8ec;
              border-radius:20px;
              cursor:crosshair;
              touch-action:none;
            ">
          </canvas>

          <div style="margin-top:15px;">
            <button id="clearCanvas"
              style="
                border:none;
                padding:10px 18px;
                border-radius:14px;
                background:#eee2f4;
                font-weight:800;
                cursor:pointer;
              ">
              Clear 🧹
            </button>
          </div>
        `;

        activityButton.textContent =
          "Save Artwork ✨";

        const canvas =
          document.getElementById("drawingCanvas");

        const ctx = canvas.getContext("2d");

        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#8d7197";

        let drawing = false;

        function position(event) {

          const rect =
            canvas.getBoundingClientRect();

          return {
            x:
              (event.clientX - rect.left) *
              (canvas.width / rect.width),

            y:
              (event.clientY - rect.top) *
              (canvas.height / rect.height)
          };

        }

        canvas.addEventListener(
          "pointerdown",
          event => {

            drawing = true;

            const p = position(event);

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);

          }
        );

        canvas.addEventListener(
          "pointermove",
          event => {

            if (!drawing) return;

            const p = position(event);

            ctx.lineTo(p.x, p.y);
            ctx.stroke();

          }
        );

        canvas.addEventListener(
          "pointerup",
          () => drawing = false
        );

        document.getElementById("clearCanvas")
          .onclick = () => {

            ctx.clearRect(
              0,
              0,
              canvas.width,
              canvas.height
            );

          };

        activityButton.onclick = () => {

          completeActivity(
            "studio",
            30,
            10
          );

          closeModal();

          showDialogue(
            "Art Studio",
            [
              "Your artwork is adorable! 🎨✨",
              "You earned some Perfect Day points."
            ]
          );

        };

      }
    );

  }


  /* =========================
     GARDEN
     ========================= */

  function openGarden() {

    openModal(
      "🌷",
      "Magic Garden",
      "Plant a flower and make the garden happier!",
      "Plant Flower 🌷",
      () => {

        activityContent.innerHTML = `
          <div style="
            font-size:70px;
            margin:25px;
          ">
            🌱
          </div>

          <p>
            Click the button to grow your flower!
          </p>
        `;

        activityButton.textContent =
          "Grow Flower 🌸";

        activityButton.onclick = () => {

          activityContent.innerHTML = `
            <div style="
              font-size:90px;
              margin:20px;
              animation:flowerMove 1s infinite;
            ">
              🌷
            </div>

            <h2>Your flower grew! 💕</h2>
          `;

          activityButton.textContent =
            "Collect Reward ✨";

          activityButton.onclick = () => {

            completeActivity(
              "garden",
              20,
              6
            );

            closeModal();

            showDialogue(
              "Garden",
              [
                "Your flower is blooming! 🌷",
                "The garden feels extra magical now."
              ]
            );

          };

        };

      }
    );

  }


  /* =========================
     SHOP
     ========================= */

  function openShop() {

    openModal(
      "🛍️",
      "Pastel Boutique",
      "Spend your coins on cute items.",
      "Shop ✨",
      () => {

        const items = [
          {
            name: "Pink Bow",
            icon: "🎀",
            price: 30
          },
          {
            name: "Purple Crown",
            icon: "👑",
            price: 50
          },
          {
            name: "Fairy Wings",
            icon: "🪽",
            price: 80
          }
        ];

        activityContent.innerHTML = `
          <div style="
            display:grid;
            grid-template-columns:repeat(3,1fr);
            gap:10px;
            margin-top:20px;
          ">
            ${items.map((item, index) => `
              <button
                class="shopItem"
                data-index="${index}"
                style="
                  padding:15px 8px;
                  border:3px solid #ead8ec;
                  border-radius:18px;
                  background:white;
                  cursor:pointer;
                ">
                <div style="font-size:35px">
                  ${item.icon}
                </div>
                <strong>${item.name}</strong>
                <br>
                🪙 ${item.price}
              </button>
            `).join("")}
          </div>
        `;

        activityButton.textContent =
          "Done Shopping 🛍️";

        document.querySelectorAll(".shopItem")
          .forEach((button, index) => {

            button.addEventListener("click", () => {

              const item = items[index];

              if (coins >= item.price) {

                coins -= item.price;

                score += 5;

                saveGame();
                updateStats();

                button.disabled = true;

                button.innerHTML =
                  `<div style="font-size:30px">✅</div>Purchased!`;

                showFloatingText(
                  `${item.name} purchased!`
                );

              } else {

                alert(
                  "You need more coins! 🪙"
                );

              }

            });

          });

        activityButton.onclick = () => {

          closeModal();

        };

      }
    );

  }


  /* =========================
     STUDY
     ========================= */

  function openStudy() {

    openModal(
      "📚",
      "Study Time",
      "Complete a tiny study session.",
      "Start Study 📚",
      () => {

        let seconds = 10;

        activityContent.innerHTML = `
          <div style="
            font-size:55px;
            margin:20px;
          ">
            📖
          </div>

          <h2 id="studyTimer">
            10
          </h2>

          <p>
            Stay focused until the timer reaches zero!
          </p>
        `;

        activityButton.disabled = true;

        const timer =
          setInterval(() => {

            seconds--;

            document.getElementById(
              "studyTimer"
            ).textContent = seconds;

            if (seconds <= 0) {

              clearInterval(timer);

              activityButton.disabled = false;

              activityButton.textContent =
                "Finish Study ✨";

              activityButton.onclick = () => {

                completeActivity(
                  "study",
                  25,
                  10
                );

                closeModal();

                showDialogue(
                  "Study Time",
                  [
                    "You did it! 📚✨",
                    "A productive little study session."
                  ]
                );

              };

            }

          }, 1000);

      }
    );

  }


  /* =========================
     PET
     ========================= */

  function petInteraction() {

    score += 10;
    mood = Math.min(100, mood + 8);

    saveGame();
    updateStats();

    showDialogue(
      "Your Pet 🐰",
      [
        "Your pet is so happy to see you! 🐰💕",
        "You got +10 Perfect Day points!"
      ]
    );

  }


  /* =========================
     MODAL
     ========================= */

  function openModal(
    icon,
    title,
    description,
    buttonText,
    action
  ) {

    modal.classList.remove("hidden");

    modalIcon.textContent = icon;
    modalTitle.textContent = title;
    modalDescription.textContent = description;

    activityContent.innerHTML = "";

    activityButton.textContent = buttonText;

    activityButton.disabled = false;

    activityButton.onclick = action;

  }


  function closeModal() {

    modal.classList.add("hidden");

  }


  closeModal.addEventListener(
    "click",
    closeModal
  );


  /* =========================
     MINI GAME
     ========================= */

  function startMiniGame() {

    miniGame.classList.remove("hidden");

    miniScore = 0;

    miniScoreDisplay.textContent =
      miniScore;

    miniGameArea.innerHTML = "";

    let remaining = 20;

    miniTimer = setInterval(() => {

      createMiniItem();

      remaining--;

      if (remaining <= 0) {

        clearInterval(miniTimer);

        setTimeout(endMiniGame, 1000);

      }

    }, 700);

  }


  function createMiniItem() {

    const item =
      document.createElement("button");

    item.className = "mini-item";

    item.textContent =
      ["🍓", "🌸", "⭐", "🦋"][
        Math.floor(Math.random() * 4)
      ];

    item.style.left =
      Math.random() * 90 + "%";

    item.style.top =
      Math.random() * 80 + "%";

    item.addEventListener(
      "click",
      () => {

        miniScore++;

        miniScoreDisplay.textContent =
          miniScore;

        item.remove();

      }
    );

    miniGameArea.appendChild(item);

    setTimeout(() => {

      if (item.parentElement) {
        item.remove();
      }

    }, 1300);

  }


  function endMiniGame() {

    const reward =
      miniScore * 3;

    coins += reward;
    score += miniScore * 5;

    saveGame();
    updateStats();

    alert(
      `Game complete! 🎉\n\nYou caught ${miniScore} items!\nYou earned ${reward} coins!`
    );

    miniGame.classList.add("hidden");

  }


  closeMiniGame.addEventListener(
    "click",
    () => {

      clearInterval(miniTimer);

      miniGame.classList.add("hidden");

    }
  );


  /* =========================
     DIALOGUE
     ========================= */

  function showDialogue(
    name,
    lines
  ) {

    dialogueLines = lines;
    dialogueIndex = 0;

    dialogueName.textContent =
      name;

    dialogueText.textContent =
      dialogueLines[0];

    dialogue.classList.remove("hidden");

  }


  dialogueNext.addEventListener(
    "click",
    () => {

      dialogueIndex++;

      if (
        dialogueIndex >=
        dialogueLines.length
      ) {

        dialogue.classList.add("hidden");

        return;

      }

      dialogueText.textContent =
        dialogueLines[dialogueIndex];

    }
  );


  /* =========================
     COMPLETE ACTIVITY
     ========================= */

  function completeActivity(
    id,
    points,
    moodGain
  ) {

    if (!completed.includes(id)) {

      completed.push(id);

      score += points;

      mood =
        Math.min(
          100,
          mood + moodGain
        );

      coins += 10;

    } else {

      score += Math.floor(points / 4);

    }

    saveGame();

    updateStats();
    updateProgress();

    showFloatingText(
      `+${points} ⭐`
    );

    if (completed.length >= 7) {

      setTimeout(() => {

        showDialogue(
          "Perfect Day! 👑",
          [
            "You completed so many activities!",
            "Your day is becoming absolutely perfect! ✨",
            `Final score: ${score} ⭐`
          ]
        );

      }, 500);

    }

  }


  /* =========================
     PROGRESS
     ========================= */

  function updateProgress() {

    const total = 7;

    const amount =
      Math.min(
        100,
        (completed.length / total) * 100
      );

    progressFill.style.width =
      amount + "%";

    const stages = [
      "Morning",
      "Getting Ready",
      "Late Morning",
      "Afternoon",
      "Golden Hour",
      "Evening",
      "Perfect Day",
      "Perfect Day Complete! 👑"
    ];

    const stage =
      Math.min(
        stages.length - 1,
        completed.length
      );

    progressText.textContent =
      stages[stage];

  }


  /* =========================
     STATS
     ========================= */

  function updateStats() {

    coinsDisplay.textContent =
      coins;

    moodDisplay.textContent =
      mood;

    scoreDisplay.textContent =
      score;

  }


  /* =========================
     SAVE
     ========================= */

  function saveGame() {

    localStorage.setItem(
      "perfectDayCoins",
      coins
    );

    localStorage.setItem(
      "perfectDayMood",
      mood
    );

    localStorage.setItem(
      "perfectDayScore",
      score
    );

    localStorage.setItem(
      "perfectDayCompleted",
      JSON.stringify(completed)
    );

  }


  /* =========================
     FLOATING TEXT
     ========================= */

  function showFloatingText(text) {

    const popup =
      document.createElement("div");

    popup.textContent = text;

    popup.style.position = "fixed";
    popup.style.left = "50%";
    popup.style.top = "45%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.zIndex = "2000";
    popup.style.padding = "12px 20px";
    popup.style.borderRadius = "18px";
    popup.style.background = "white";
    popup.style.color = "#76566d";
    popup.style.fontWeight = "900";
    popup.style.boxShadow =
      "0 10px 30px rgba(80,60,90,.2)";
    popup.style.pointerEvents = "none";

    document.body.appendChild(popup);

    popup.animate(
      [
        {
          opacity: 0,
          transform:
            "translate(-50%, -20%) scale(.8)"
        },
        {
          opacity: 1,
          transform:
            "translate(-50%, -50%) scale(1)"
        },
        {
          opacity: 0,
          transform:
            "translate(-50%, -90%) scale(1.05)"
        }
      ],
      {
        duration: 1200,
        easing: "ease-out"
      }
    );

    setTimeout(() => {
      popup.remove();
    }, 1200);

  }


  /* =========================
     BLOCK MOVEMENT WHILE UI OPEN
     ========================= */

  function isBlocked() {

    return (
      !dialogue.classList.contains("hidden") ||
      !modal.classList.contains("hidden") ||
      !miniGame.classList.contains("hidden")
    );

  }


  /* =========================
     CLOSE EVERYTHING
     ========================= */

  function closeAll() {

    dialogue.classList.add("hidden");
    modal.classList.add("hidden");
    miniGame.classList.add("hidden");

    clearInterval(miniTimer);

  }


  /* =========================
     SHOP / MINI GAME SECRET
     ========================= */

  /* Double-click the pet to start the mini-game */

  let petClicks = 0;

  document
    .getElementById("pet")
    .addEventListener("dblclick", () => {

      if (gameStarted) {
        startMiniGame();
      }

    });


  /* =========================
     RESET SAVE
     ========================= */

  window.resetPerfectDay = function() {

    localStorage.removeItem(
      "perfectDayCoins"
    );

    localStorage.removeItem(
      "perfectDayMood"
    );

    localStorage.removeItem(
      "perfectDayScore"
    );

    localStorage.removeItem(
      "perfectDayCompleted"
    );

    location.reload();

  };

});
```
