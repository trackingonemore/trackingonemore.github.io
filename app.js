const STORAGE_KEY = "oneMoreWebState";
const TARGETS = {
  calories: 2200,
  protein: 160,
  carbs: 240,
  fat: 70,
  move: 500,
  workoutMinutes: 45,
};

const barcodeLibrary = {
  "012345678905": { name: "Greek Yogurt", calories: 130, protein: 14, carbs: 9, fat: 3 },
  "036000291452": { name: "Peanut Butter", calories: 190, protein: 8, carbs: 7, fat: 16 },
  "049000050103": { name: "Sparkling Water", calories: 0, protein: 0, carbs: 0, fat: 0 },
};

const defaultState = {
  foodEntries: [
    {
      id: cryptoId(),
      name: "Protein shake",
      timestamp: new Date().toISOString(),
      calories: 220,
      protein: 32,
      carbs: 10,
      fat: 4,
      ingredients: "Whey, almond milk, banana",
      notes: "Post-workout",
    },
    {
      id: cryptoId(),
      name: "Chicken salad bowl",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      calories: 480,
      protein: 38,
      carbs: 35,
      fat: 18,
      ingredients: "Chicken, greens, olive oil",
      notes: "Light lunch",
    },
  ],
  workouts: [
    {
      id: cryptoId(),
      type: "cycling",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      duration: 25,
      distance: 7,
      machine: "Bike",
      weight: 0,
      notes: "Intervals",
    },
  ],
  profile: {
    name: "",
    dob: "",
    height: "",
    weight: "",
    goal: "getLean",
    dietary: "",
    notes: "",
  },
};

const state = loadState();

const views = document.querySelectorAll(".view");
const navLinks = document.querySelectorAll("[data-view-link]");
const topbarTitle = document.getElementById("topbarTitle");

const drawer = document.getElementById("mobileDrawer");
const openDrawerBtn = document.getElementById("openDrawer");
const closeDrawerBtn = document.getElementById("closeDrawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");

const foodHistoryList = document.getElementById("foodHistoryList");
const foodLogList = document.getElementById("foodLogList");
const workoutHistoryList = document.getElementById("workoutHistoryList");
const workoutsList = document.getElementById("workoutsList");
const profileSummary = document.getElementById("profileSummary");

const barcodeInput = document.getElementById("barcodeInput");
const barcodeLookupBtn = document.getElementById("barcodeLookup");
const barcodeFile = document.getElementById("barcodeFile");
const barcodePreview = document.getElementById("barcodePreview");
const barcodeStatus = document.getElementById("barcodeStatus");
const scanButton = document.getElementById("scanButton");
const quickAddFoodBtn = document.getElementById("quickAddFood");
const quickAddWorkoutBtn = document.getElementById("quickAddWorkout");

const todayLabel = document.getElementById("todayLabel");
const summaryCalories = document.getElementById("summaryCalories");
const summaryProtein = document.getElementById("summaryProtein");
const summaryCarbs = document.getElementById("summaryCarbs");
const summaryFat = document.getElementById("summaryFat");
const summaryMove = document.getElementById("summaryMove");
const summaryWorkout = document.getElementById("summaryWorkout");
const calorieProgress = document.getElementById("calorieProgress");
const proteinProgress = document.getElementById("proteinProgress");
const carbProgress = document.getElementById("carbProgress");
const fatProgress = document.getElementById("fatProgress");

const addMenu = document.getElementById("addMenu");

function cryptoId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(16).slice(2)}`;
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return cloneValue(defaultState);
  try {
    const parsed = JSON.parse(saved);
    return {
      ...defaultState,
      ...parsed,
    };
  } catch (error) {
    return cloneValue(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setView(viewName) {
  views.forEach((view) => {
    view.classList.toggle("is-active", view.dataset.view === viewName);
  });
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.viewLink === viewName);
  });
  topbarTitle.textContent = capitalize(viewName);
  document.body.classList.remove("drawer-open");
}

function initRouting() {
  const initial = location.hash.replace("#", "") || "dashboard";
  setView(initial);

  window.addEventListener("hashchange", () => {
    const target = location.hash.replace("#", "") || "dashboard";
    setView(target);
  });
}

function initDrawer() {
  if (!openDrawerBtn) return;
  openDrawerBtn.addEventListener("click", () => {
    document.body.classList.add("drawer-open");
  });
  closeDrawerBtn.addEventListener("click", () => {
    document.body.classList.remove("drawer-open");
  });
  drawerBackdrop.addEventListener("click", () => {
    document.body.classList.remove("drawer-open");
  });
}

function initNavButtons() {
  document.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => {
      location.hash = btn.dataset.go;
    });
  });

  document.querySelectorAll("[data-menu-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.menuAdd;
      addMenu.removeAttribute("open");
      if (target === "food") {
        location.hash = "food";
        scrollToForm("food");
      }
      if (target === "workout") {
        location.hash = "workouts";
        scrollToForm("workout");
      }
    });
  });
}

function scrollToForm(type) {
  const form = document.querySelector(`.js-${type}-form`);
  if (form) {
    setTimeout(() => {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  }
}

function initFoodForms() {
  document.querySelectorAll(".js-food-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const entry = {
        id: cryptoId(),
        name: data.get("name")?.toString().trim() || "Untitled meal",
        timestamp: data.get("timestamp") || new Date().toISOString(),
        calories: toNumber(data.get("calories")),
        protein: toNumber(data.get("protein")),
        carbs: toNumber(data.get("carbs")),
        fat: toNumber(data.get("fat")),
        ingredients: data.get("ingredients")?.toString().trim() || "",
        notes: data.get("notes")?.toString().trim() || "",
      };
      state.foodEntries.unshift(entry);
      saveState();
      renderAll();
      form.reset();
    });
  });
}

function initWorkoutForms() {
  document.querySelectorAll(".js-workout-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const entry = {
        id: cryptoId(),
        type: data.get("type") || "other",
        timestamp: data.get("timestamp") || new Date().toISOString(),
        duration: toNumber(data.get("duration")),
        distance: toNumber(data.get("distance")),
        machine: data.get("machine")?.toString().trim() || "",
        weight: toNumber(data.get("weight")),
        notes: data.get("notes")?.toString().trim() || "",
      };
      state.workouts.unshift(entry);
      saveState();
      renderAll();
      form.reset();
    });
  });
}

function initProfileForm() {
  const form = document.getElementById("profileForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    state.profile = {
      name: data.get("name")?.toString().trim() || "",
      dob: data.get("dob") || "",
      height: data.get("height") || "",
      weight: data.get("weight") || "",
      goal: data.get("goal") || "getLean",
      dietary: data.get("dietary")?.toString().trim() || "",
      notes: data.get("notes")?.toString().trim() || "",
    };
    saveState();
    renderProfile();
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      form.reset();
    }, 0);
  });
}

function initBarcode() {
  if (!barcodeInput) return;
  barcodeLookupBtn.addEventListener("click", () => {
    const code = barcodeInput.value.trim();
    const match = barcodeLibrary[code];
    if (match) {
      barcodeStatus.textContent = `Found: ${match.name}. Loaded into the form.`;
      fillFoodForms(match);
    } else {
      barcodeStatus.textContent = "Barcode not in demo library. Add details manually.";
    }
  });

  scanButton.addEventListener("click", () => {
    barcodeFile.click();
  });

  barcodeFile.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    barcodePreview.src = url;
    barcodePreview.style.display = "block";

    if ("BarcodeDetector" in window) {
      barcodeStatus.textContent = "Detecting barcode...";
      try {
        const detector = new BarcodeDetector({
          formats: ["ean_13", "upc_a", "upc_e", "ean_8", "code_128"],
        });
        const imageBitmap = await createImageBitmap(file);
        const barcodes = await detector.detect(imageBitmap);
        if (barcodes.length > 0) {
          const value = barcodes[0].rawValue;
          barcodeInput.value = value;
          barcodeStatus.textContent = `Detected: ${value}`;
        } else {
          barcodeStatus.textContent = "No barcode detected. Try a clearer photo.";
        }
      } catch (error) {
        barcodeStatus.textContent = "Barcode detection failed. Try manual entry.";
      }
    } else {
      barcodeStatus.textContent = "BarcodeDetector not supported. Use manual entry.";
    }

    URL.revokeObjectURL(url);
  });

  quickAddFoodBtn.addEventListener("click", () => {
    const code = barcodeInput.value.trim();
    const match = barcodeLibrary[code];
    const entry = {
      id: cryptoId(),
      name: match?.name || "Barcode item",
      timestamp: new Date().toISOString(),
      calories: match?.calories || 0,
      protein: match?.protein || 0,
      carbs: match?.carbs || 0,
      fat: match?.fat || 0,
      ingredients: code ? `Barcode ${code}` : "",
      notes: "Quick add",
    };
    state.foodEntries.unshift(entry);
    saveState();
    renderAll();
  });

  quickAddWorkoutBtn.addEventListener("click", () => {
    const entry = {
      id: cryptoId(),
      type: "other",
      timestamp: new Date().toISOString(),
      duration: 20,
      distance: 0,
      machine: "",
      weight: 0,
      notes: "Quick add",
    };
    state.workouts.unshift(entry);
    saveState();
    renderAll();
  });
}

function fillFoodForms(values) {
  document.querySelectorAll(".js-food-form").forEach((form) => {
    form.querySelector("input[name='name']").value = values.name || "";
    form.querySelector("input[name='calories']").value = values.calories || 0;
    form.querySelector("input[name='protein']").value = values.protein || 0;
    form.querySelector("input[name='carbs']").value = values.carbs || 0;
    form.querySelector("input[name='fat']").value = values.fat || 0;
  });
}

function renderAll() {
  renderSummary();
  renderFoodHistory();
  renderFoodLog();
  renderWorkoutHistory();
  renderWorkouts();
  renderProfile();
}

function renderSummary() {
  const today = new Date();
  todayLabel.textContent = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const todayFoods = state.foodEntries.filter((entry) => isSameDay(new Date(entry.timestamp), today));
  const totals = todayFoods.reduce(
    (acc, entry) => {
      acc.calories += entry.calories || 0;
      acc.protein += entry.protein || 0;
      acc.carbs += entry.carbs || 0;
      acc.fat += entry.fat || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const todayWorkouts = state.workouts.filter((entry) => isSameDay(new Date(entry.timestamp), today));
  const workoutMinutes = todayWorkouts.reduce((acc, entry) => acc + (entry.duration || 0), 0);
  const moveCalories = Math.round(workoutMinutes * 7.5);

  summaryCalories.textContent = `${Math.round(totals.calories)} kcal`;
  summaryProtein.textContent = `${Math.round(totals.protein)} g`;
  summaryCarbs.textContent = `${Math.round(totals.carbs)} g`;
  summaryFat.textContent = `${Math.round(totals.fat)} g`;
  summaryMove.textContent = `${Math.round(moveCalories)} kcal`;
  summaryWorkout.textContent = `${Math.round(workoutMinutes)} min`;

  calorieProgress.style.width = `${Math.min(100, (totals.calories / TARGETS.calories) * 100)}%`;
  proteinProgress.style.width = `${Math.min(100, (totals.protein / TARGETS.protein) * 100)}%`;
  carbProgress.style.width = `${Math.min(100, (totals.carbs / TARGETS.carbs) * 100)}%`;
  fatProgress.style.width = `${Math.min(100, (totals.fat / TARGETS.fat) * 100)}%`;
}

function renderFoodHistory() {
  const grouped = groupEntriesByDay(state.foodEntries);
  const days = grouped.slice(0, 7);
  foodHistoryList.innerHTML = "";
  if (days.length === 0) {
    foodHistoryList.innerHTML = "<div class='muted'>No food entries yet.</div>";
    return;
  }

  days.forEach((day) => {
    const item = document.createElement("div");
    item.className = "list-item";
    const totals = day.entries.reduce(
      (acc, entry) => {
        acc.calories += entry.calories || 0;
        acc.protein += entry.protein || 0;
        acc.carbs += entry.carbs || 0;
        acc.fat += entry.fat || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    item.innerHTML = `
      <div>
        <h4>${formatDay(day.date)}</h4>
        <div class="list-meta">${day.entries.length} entries</div>
      </div>
      <div>
        <div class="badge food">${Math.round(totals.calories)} kcal</div>
        <div class="list-meta">P ${Math.round(totals.protein)}g · C ${Math.round(totals.carbs)}g · F ${Math.round(totals.fat)}g</div>
      </div>
    `;
    foodHistoryList.appendChild(item);
  });
}

function renderFoodLog() {
  foodLogList.innerHTML = "";
  if (state.foodEntries.length === 0) {
    foodLogList.innerHTML = "<div class='muted'>No food entries yet.</div>";
    return;
  }

  state.foodEntries
    .slice()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .forEach((entry) => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `
        <div>
          <h4>${entry.name}</h4>
          <div class="list-meta">${formatDateTime(entry.timestamp)}</div>
          <div class="list-meta">${entry.ingredients || "No ingredients listed"}</div>
        </div>
        <div>
          <div class="badge food">${Math.round(entry.calories || 0)} kcal</div>
          <div class="list-meta">P ${Math.round(entry.protein || 0)}g · C ${Math.round(entry.carbs || 0)}g · F ${Math.round(entry.fat || 0)}g</div>
          <button class="link-btn" data-food-delete="${entry.id}">Remove</button>
        </div>
      `;
      foodLogList.appendChild(item);
    });
}

function renderWorkoutHistory() {
  workoutHistoryList.innerHTML = "";
  const recent = state.workouts
    .slice()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  if (recent.length === 0) {
    workoutHistoryList.innerHTML = "<div class='muted'>No workouts yet.</div>";
    return;
  }

  recent.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <div>
        <h4>${capitalize(entry.type)}</h4>
        <div class="list-meta">${formatDateTime(entry.timestamp)}</div>
        <div class="list-meta">${entry.machine || ""}</div>
      </div>
      <div>
        <div class="badge workout">${Math.round(entry.duration || 0)} min</div>
        <div class="list-meta">${entry.distance || 0} km</div>
      </div>
    `;
    workoutHistoryList.appendChild(item);
  });
}

function renderWorkouts() {
  workoutsList.innerHTML = "";
  if (state.workouts.length === 0) {
    workoutsList.innerHTML = "<div class='muted'>No workouts yet.</div>";
    return;
  }

  state.workouts
    .slice()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .forEach((entry) => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `
        <div>
          <h4>${capitalize(entry.type)}</h4>
          <div class="list-meta">${formatDateTime(entry.timestamp)}</div>
          <div class="list-meta">${entry.machine || ""}</div>
        </div>
        <div>
          <div class="badge workout">${Math.round(entry.duration || 0)} min</div>
          <div class="list-meta">${entry.distance || 0} km</div>
          <button class="link-btn" data-workout-delete="${entry.id}">Remove</button>
        </div>
      `;
      workoutsList.appendChild(item);
    });
}

function renderProfile() {
  const form = document.getElementById("profileForm");
  if (form) {
    form.elements["name"].value = state.profile.name || "";
    form.elements["dob"].value = state.profile.dob || "";
    form.elements["height"].value = state.profile.height || "";
    form.elements["weight"].value = state.profile.weight || "";
    form.elements["goal"].value = state.profile.goal || "getLean";
    form.elements["dietary"].value = state.profile.dietary || "";
    form.elements["notes"].value = state.profile.notes || "";
  }

  const latestFood = state.foodEntries[0];
  const latestWorkout = state.workouts[0];

  profileSummary.innerHTML = "";
  const items = [
    { label: "Latest meal", value: latestFood ? latestFood.name : "No entries" },
    { label: "Latest workout", value: latestWorkout ? capitalize(latestWorkout.type) : "No entries" },
    { label: "Primary goal", value: formatGoal(state.profile.goal) },
  ];

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "profile-item";
    div.innerHTML = `<div class="label">${item.label}</div><div class="value">${item.value}</div>`;
    profileSummary.appendChild(div);
  });
}

function initDeleteHandlers() {
  foodLogList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-food-delete]");
    if (!button) return;
    const id = button.dataset.foodDelete;
    state.foodEntries = state.foodEntries.filter((entry) => entry.id !== id);
    saveState();
    renderAll();
  });

  workoutsList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-workout-delete]");
    if (!button) return;
    const id = button.dataset.workoutDelete;
    state.workouts = state.workouts.filter((entry) => entry.id !== id);
    saveState();
    renderAll();
  });
}

function groupEntriesByDay(entries) {
  const grouped = {};
  entries.forEach((entry) => {
    const date = new Date(entry.timestamp);
    const key = date.toDateString();
    if (!grouped[key]) {
      grouped[key] = { date, entries: [] };
    }
    grouped[key].entries.push(entry);
  });
  return Object.values(grouped).sort((a, b) => b.date - a.date);
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDay(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatGoal(goal) {
  switch (goal) {
    case "loseWeight":
      return "Lose weight";
    case "maintain":
      return "Maintain";
    case "gainMuscle":
      return "Gain muscle";
    case "getLean":
      return "Get lean";
    default:
      return "Not set";
  }
}

initRouting();
initDrawer();
initNavButtons();
initFoodForms();
initWorkoutForms();
initProfileForm();
initBarcode();
initDeleteHandlers();
renderAll();
