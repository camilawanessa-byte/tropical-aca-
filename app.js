const STORE_WHATSAPP = "5584991433732";
const MENU_STORAGE_KEY = "tropical-acai-menu";
const ADMIN_STORAGE_KEY = "tropical-acai-admin";
const ADMIN_USER = "admin";
const ADMIN_PASS = "tropical123";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const fallbackMenu = {
  sizes: [
    { id: "300ml", name: "Açaí 300ml", price: 10, desc: "Copo individual cremoso", paused: false },
    { id: "500ml", name: "Açaí 500ml", price: 15, desc: "Copo maior para caprichar", paused: false },
  ],
  creams: [
    { id: "sensacao", name: "Sensação", price: 0, desc: "Com raspas de chocolate", paused: false },
    { id: "ninho", name: "Ninho", price: 0, desc: "Creme leve e doce", paused: false },
    { id: "acai-tradicional", name: "Açaí tradicional", price: 0, desc: "Sabor clássico da casa", paused: false },
    { id: "cupuacu", name: "Cupuaçu", price: 0, desc: "Tropical e levemente azedinho", paused: false },
    { id: "creme-tapioca", name: "Creme de tapioca", price: 0, desc: "Cremoso e regional", paused: false },
    { id: "abacaxi", name: "Abacaxi", price: 0, desc: "Refrescante e tropical", paused: false },
    { id: "ninho-trufado", name: "Ninho trufado", price: 0, desc: "Ninho com toque trufado", paused: false },
  ],
  fillings: [
    { id: "granola", name: "Granola", price: 0, desc: "Crocante tradicional", paused: false },
    { id: "leite-po", name: "Leite em pó", price: 0, desc: "Finalização cremosa", paused: false },
    { id: "confete", name: "Confete", price: 0, desc: "Colorido e doce", paused: false },
    { id: "amendoim", name: "Amendoim", price: 0, desc: "Crocância extra", paused: false },
    { id: "chocoball", name: "Chocoball", price: 0, desc: "Bolinha de chocolate", paused: false },
  ],
  fruits: [
    { id: "banana", name: "Banana", price: 0, desc: "Combina com tudo", paused: false },
    { id: "morango-fruta", name: "Morango", price: 0, desc: "Fresco e docinho", paused: false },
    { id: "kiwi", name: "Kiwi", price: 1.5, desc: "Extra tropical", paused: false },
    { id: "manga", name: "Manga", price: 1.5, desc: "Doce e suculenta", paused: false },
  ],
  toppings: [
    { id: "leite-condensado", name: "Leite condensado", price: 0, desc: "Cobertura clássica", paused: false },
    { id: "chocolate-calda", name: "Calda de chocolate", price: 0, desc: "Doce na medida", paused: false },
    { id: "morango-calda", name: "Calda de morango", price: 0, desc: "Frutada e brilhante", paused: false },
    { id: "mel", name: "Mel", price: 0, desc: "Toque natural", paused: false },
  ],
  extras: [
    { id: "nutella", name: "Nutella", price: 4, desc: "Camada extra especial", paused: false },
    { id: "ovomaltine", name: "Ovomaltine", price: 3, desc: "Crocante maltado", paused: false },
    { id: "bis", name: "Bis picado", price: 3, desc: "Chocolate crocante", paused: false },
    { id: "dose-acai", name: "Dose extra de açaí", price: 5, desc: "Mais sabor no copo", paused: false },
  ],
};

const categoryLabels = {
  sizes: "Tamanhos",
  creams: "Sabores",
  fillings: "Recheios",
  fruits: "Frutas",
  toppings: "Coberturas",
  extras: "Extras",
};

let menu = structuredClone(fallbackMenu);

const state = {
  size: null,
  creams: [],
  fillings: [],
  fruits: [],
  topping: null,
  extras: [],
};

const limits = {
  creams: 3,
  fillingsAndFruits: 3,
};

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".option-panel");
const cartLines = document.querySelector("#cartLines");
const cartTotal = document.querySelector("#cartTotal");
const clearCart = document.querySelector("#clearCart");
const checkoutForm = document.querySelector("#checkoutForm");
const formNote = document.querySelector("#formNote");
const redeemButton = document.querySelector(".redeem-button");
const adminLogin = document.querySelector("#adminLogin");
const adminPanel = document.querySelector("#adminPanel");
const adminLoginNote = document.querySelector("#adminLoginNote");
const adminLogout = document.querySelector("#adminLogout");
const adminAddForm = document.querySelector("#adminAddForm");
const adminProducts = document.querySelector("#adminProducts");
const adminSummary = document.querySelector("#adminSummary");
const resetMenu = document.querySelector("#resetMenu");

function normalizeItem(item) {
  return {
    ...item,
    price: Number(item.price) || 0,
    paused: Boolean(item.paused),
  };
}

function normalizeMenu(nextMenu) {
  return Object.fromEntries(
    Object.keys(fallbackMenu).map((category) => {
      const items = Array.isArray(nextMenu?.[category]) ? nextMenu[category] : fallbackMenu[category];
      return [category, items.map(normalizeItem)];
    })
  );
}

async function loadMenu() {
  const savedMenu = localStorage.getItem(MENU_STORAGE_KEY);

  if (savedMenu) {
    menu = normalizeMenu(JSON.parse(savedMenu));
    return;
  }

  try {
    const response = await fetch("cardapio.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Cardápio indisponível");
    menu = normalizeMenu(await response.json());
  } catch {
    menu = structuredClone(fallbackMenu);
  }
}

function saveMenu() {
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menu));
}

function makeId(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") + `-${Date.now().toString(36)}`;
}

function activeItems(category) {
  return menu[category].filter((item) => !item.paused);
}

function getItem(category, id) {
  return menu[category].find((item) => item.id === id);
}

function selectedFillingsCount() {
  return state.fillings.length + state.fruits.length;
}

function optionPrice(item) {
  return item.price > 0 ? `+ ${currency.format(item.price)}` : "Incluso";
}

function renderOptions() {
  Object.keys(menu).forEach((category) => {
    const grid = document.querySelector(`[data-options="${category}"]`);
    grid.innerHTML = "";

    activeItems(category).forEach((item) => {
      const button = document.createElement("button");
      button.className = "option-card";
      button.type = "button";
      button.dataset.category = category;
      button.dataset.id = item.id;
      button.innerHTML = `
        <strong>${item.name}</strong>
        <span>${item.desc}</span>
        <span>${category === "sizes" ? currency.format(item.price) : optionPrice(item)}</span>
      `;
      button.addEventListener("click", () => toggleOption(category, item.id));
      grid.appendChild(button);
    });

    if (!grid.children.length) {
      grid.innerHTML = `<p class="empty-category">Todos os itens desta categoria estão pausados.</p>`;
    }
  });

  clearUnavailableSelections();
  updateSelectedCards();
}

function clearUnavailableSelections() {
  if (state.size && !activeItems("sizes").some((item) => item.id === state.size)) state.size = null;
  state.creams = state.creams.filter((id) => activeItems("creams").some((item) => item.id === id));
  state.fillings = state.fillings.filter((id) => activeItems("fillings").some((item) => item.id === id));
  state.fruits = state.fruits.filter((id) => activeItems("fruits").some((item) => item.id === id));
  if (state.topping && !activeItems("toppings").some((item) => item.id === state.topping)) state.topping = null;
  state.extras = state.extras.filter((id) => activeItems("extras").some((item) => item.id === id));
}

function toggleFromList(list, id, limit) {
  if (list.includes(id)) return list.filter((itemId) => itemId !== id);

  if (list.length >= limit) {
    formNote.textContent = `Você pode escolher até ${limit} opções nessa categoria.`;
    return list;
  }

  formNote.textContent = "";
  return [...list, id];
}

function toggleOption(category, id) {
  if (category === "sizes") state.size = id;
  if (category === "creams") state.creams = toggleFromList(state.creams, id, limits.creams);

  if (category === "fillings") {
    if (state.fillings.includes(id)) {
      state.fillings = state.fillings.filter((itemId) => itemId !== id);
    } else if (selectedFillingsCount() < limits.fillingsAndFruits) {
      state.fillings = [...state.fillings, id];
      formNote.textContent = "";
    } else {
      formNote.textContent = "Você pode escolher até 3 itens entre recheios e frutas.";
    }
  }

  if (category === "fruits") {
    if (state.fruits.includes(id)) {
      state.fruits = state.fruits.filter((itemId) => itemId !== id);
    } else if (selectedFillingsCount() < limits.fillingsAndFruits) {
      state.fruits = [...state.fruits, id];
      formNote.textContent = "";
    } else {
      formNote.textContent = "Você pode escolher até 3 itens entre recheios e frutas.";
    }
  }

  if (category === "toppings") state.topping = state.topping === id ? null : id;
  if (category === "extras") {
    state.extras = state.extras.includes(id)
      ? state.extras.filter((itemId) => itemId !== id)
      : [...state.extras, id];
  }

  updateSelectedCards();
  renderCart();
}

function updateSelectedCards() {
  document.querySelectorAll(".option-card").forEach((card) => {
    const category = card.dataset.category;
    const id = card.dataset.id;
    const selected =
      (category === "sizes" && state.size === id) ||
      (category === "creams" && state.creams.includes(id)) ||
      (category === "fillings" && state.fillings.includes(id)) ||
      (category === "fruits" && state.fruits.includes(id)) ||
      (category === "toppings" && state.topping === id) ||
      (category === "extras" && state.extras.includes(id));

    card.classList.toggle("selected", selected);
    card.setAttribute("aria-pressed", selected ? "true" : "false");
  });
}

function getSelections() {
  const size = state.size ? getItem("sizes", state.size) : null;
  const creams = state.creams.map((id) => getItem("creams", id)).filter(Boolean);
  const fillings = state.fillings.map((id) => getItem("fillings", id)).filter(Boolean);
  const fruits = state.fruits.map((id) => getItem("fruits", id)).filter(Boolean);
  const topping = state.topping ? getItem("toppings", state.topping) : null;
  const extras = state.extras.map((id) => getItem("extras", id)).filter(Boolean);
  return { size, creams, fillings, fruits, topping, extras };
}

function calculateTotal() {
  const selections = getSelections();
  const groups = [
    selections.size ? [selections.size] : [],
    selections.creams,
    selections.fillings,
    selections.fruits,
    selections.topping ? [selections.topping] : [],
    selections.extras,
  ];

  return groups.flat().reduce((total, item) => total + item.price, 0);
}

function names(items) {
  return items.length ? items.map((item) => item.name).join(", ") : "Nenhum selecionado";
}

function renderCart() {
  const selections = getSelections();
  cartTotal.textContent = currency.format(calculateTotal());

  if (!selections.size) {
    cartLines.innerHTML = `<div class="empty-cart">Escolha um tamanho para começar seu pedido.</div>`;
    return;
  }

  cartLines.innerHTML = `
    <div class="cart-line"><strong>Tamanho</strong><span>${selections.size.name}</span></div>
    <div class="cart-line"><strong>Sabores</strong><span>${names(selections.creams)}</span></div>
    <div class="cart-line"><strong>Recheios</strong><span>${names(selections.fillings)}</span></div>
    <div class="cart-line"><strong>Frutas</strong><span>${names(selections.fruits)}</span></div>
    <div class="cart-line"><strong>Cobertura</strong><span>${selections.topping ? selections.topping.name : "Nenhuma selecionada"}</span></div>
    <div class="cart-line"><strong>Extras</strong><span>${names(selections.extras)}</span></div>
  `;
}

function resetOrder() {
  state.size = null;
  state.creams = [];
  state.fillings = [];
  state.fruits = [];
  state.topping = null;
  state.extras = [];
  formNote.textContent = "";
  updateSelectedCards();
  renderCart();
}

function buildWhatsappMessage() {
  const selections = getSelections();
  const name = document.querySelector("#customerName").value.trim();
  const phone = document.querySelector("#customerPhone").value.trim();
  const address = document.querySelector("#customerAddress").value.trim();
  const payment = document.querySelector("#paymentMethod").value;
  const notes = document.querySelector("#orderNotes").value.trim() || "Sem observações";

  return [
    "Olá, Tropical Açaí! Quero finalizar meu pedido:",
    "",
    `Cliente: ${name}`,
    `WhatsApp: ${phone}`,
    `Endereço: ${address}`,
    `Pagamento: ${payment}`,
    "",
    `Tamanho: ${selections.size.name}`,
    `Sabores: ${names(selections.creams)}`,
    `Recheios: ${names(selections.fillings)}`,
    `Frutas: ${names(selections.fruits)}`,
    `Cobertura: ${selections.topping ? selections.topping.name : "Nenhuma selecionada"}`,
    `Extras: ${names(selections.extras)}`,
    "",
    `Observações: ${notes}`,
    `Total: ${currency.format(calculateTotal())}`,
    "",
    "Meu ponto deve ser validado no Programa Fidelidade Tropical Açaí.",
  ].join("\n");
}

function setAdminVisible(isVisible) {
  adminPanel.hidden = !isVisible;
  adminLogin.hidden = isVisible;
  localStorage.setItem(ADMIN_STORAGE_KEY, isVisible ? "true" : "false");
  if (isVisible) renderAdminProducts();
}

function renderAdminProducts() {
  const rows = Object.entries(menu).flatMap(([category, items]) =>
    items.map((item) => ({ category, item }))
  );

  adminSummary.textContent = `${rows.length} produtos cadastrados`;
  adminProducts.innerHTML = rows
    .map(({ category, item }) => `
      <article class="admin-product ${item.paused ? "is-paused" : ""}" data-category="${category}" data-id="${item.id}">
        <div>
          <span>${categoryLabels[category]}</span>
          <strong>${item.name}</strong>
          <small>${item.desc}</small>
        </div>
        <label>
          Preço
          <input class="admin-price" type="number" min="0" step="0.01" value="${item.price}" />
        </label>
        <button class="ghost-button pause-product" type="button">${item.paused ? "Reativar" : "Pausar"}</button>
      </article>
    `)
    .join("");
}

function syncMenuAfterAdminChange() {
  saveMenu();
  renderOptions();
  renderCart();
  renderAdminProducts();
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    panels.forEach((panel) => panel.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add("active");
  });
});

clearCart.addEventListener("click", resetOrder);

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!state.size) {
    formNote.textContent = "Escolha o tamanho do açaí antes de finalizar.";
    document.querySelector("#cardapio").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (!state.topping) {
    formNote.textContent = "Escolha uma cobertura antes de finalizar.";
    document.querySelector('[data-tab="toppings"]').click();
    document.querySelector("#pedido").scrollIntoView({ behavior: "smooth" });
    return;
  }

  const message = encodeURIComponent(buildWhatsappMessage());
  window.open(`https://wa.me/${STORE_WHATSAPP}?text=${message}`, "_blank");
});

redeemButton.addEventListener("click", () => {
  const originalText = redeemButton.textContent;
  redeemButton.textContent = "Prêmio reservado";
  redeemButton.classList.add("is-confirmed");

  window.setTimeout(() => {
    redeemButton.textContent = originalText;
    redeemButton.classList.remove("is-confirmed");
  }, 2400);
});

adminLogin.addEventListener("submit", (event) => {
  event.preventDefault();
  const user = document.querySelector("#adminUser").value.trim();
  const pass = document.querySelector("#adminPass").value;

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    adminLoginNote.textContent = "";
    setAdminVisible(true);
    return;
  }

  adminLoginNote.textContent = "Usuário ou senha inválidos.";
});

adminLogout.addEventListener("click", () => {
  setAdminVisible(false);
});

adminAddForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const category = document.querySelector("#adminCategory").value;
  const name = document.querySelector("#adminProductName").value.trim();
  const price = Number(document.querySelector("#adminProductPrice").value) || 0;
  const desc = document.querySelector("#adminProductDesc").value.trim();

  menu[category].push({
    id: makeId(name),
    name,
    price,
    desc,
    paused: false,
  });

  adminAddForm.reset();
  document.querySelector("#adminProductPrice").value = "0";
  syncMenuAfterAdminChange();
});

adminProducts.addEventListener("input", (event) => {
  if (!event.target.classList.contains("admin-price")) return;

  const row = event.target.closest(".admin-product");
  const item = getItem(row.dataset.category, row.dataset.id);
  item.price = Number(event.target.value) || 0;
  saveMenu();
  renderOptions();
  renderCart();
});

adminProducts.addEventListener("click", (event) => {
  if (!event.target.classList.contains("pause-product")) return;

  const row = event.target.closest(".admin-product");
  const item = getItem(row.dataset.category, row.dataset.id);
  item.paused = !item.paused;
  syncMenuAfterAdminChange();
});

resetMenu.addEventListener("click", () => {
  menu = structuredClone(fallbackMenu);
  resetOrder();
  syncMenuAfterAdminChange();
});

loadMenu().then(() => {
  renderOptions();
  renderCart();
  setAdminVisible(localStorage.getItem(ADMIN_STORAGE_KEY) === "true");
});
