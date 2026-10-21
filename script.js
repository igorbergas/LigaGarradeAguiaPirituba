const KEY = "liga-garra-v3";
const BELTS = [
  "Branca",
  "Amarela",
  "Laranja",
  "Verde",
  "Azul",
  "Marrom",
  "Preta",
];
const DAYS = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];
const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const today = () => new Date().toLocaleDateString("pt-BR");
const isoToday = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 6e4)
    .toISOString()
    .slice(0, 10);
const brDate = (iso) => iso.split("-").reverse().join("/");
const money = (v) =>
  "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

const student = (
  id,
  name,
  phone,
  turma,
  belt,
  active,
  joined,
  attendance,
  lastGrad,
) => ({
  id,
  name,
  phone,
  email: name.split(" ")[0].toLowerCase() + "@email.com",
  turma,
  belt,
  active,
  joined,
  attendance,
  lastGrad,
});
const seed = {
  students: [
    student(
      1,
      "João Silva",
      "(11) 98765-4321",
      "Adultos — Iniciante",
      "Amarela",
      true,
      "10/01/2026",
      80,
      "10/06/2026",
    ),
    student(
      2,
      "Pedro Santos",
      "(11) 98888-1122",
      "Infantil",
      "Branca",
      true,
      "15/02/2026",
      92,
      "15/02/2026",
    ),
    student(
      3,
      "Lucas Souza",
      "(11) 97777-2233",
      "Adultos — Avançado",
      "Verde",
      true,
      "20/01/2026",
      76,
      "20/07/2026",
    ),
    student(
      4,
      "Gabriel Lima",
      "(11) 96666-3344",
      "Adultos — Iniciante",
      "Laranja",
      true,
      "02/03/2026",
      88,
      "02/08/2026",
    ),
    student(
      5,
      "Matheus Costa",
      "(11) 95555-4455",
      "Infantil",
      "Branca",
      false,
      "12/02/2026",
      60,
      "12/02/2026",
    ),
  ],
  payments: [
    {
      id: 1,
      student: "João Silva",
      value: 100,
      due: "10/09/2026",
      status: "paid",
    },
    {
      id: 2,
      student: "Pedro Santos",
      value: 100,
      due: "10/09/2026",
      status: "paid",
    },
    {
      id: 3,
      student: "Lucas Souza",
      value: 100,
      due: "10/09/2026",
      status: "pending",
    },
    {
      id: 4,
      student: "Gabriel Lima",
      value: 100,
      due: "10/09/2026",
      status: "paid",
    },
    {
      id: 5,
      student: "Matheus Costa",
      value: 100,
      due: "10/09/2026",
      status: "pending",
    },
  ],
  notices: [
    {
      title: "Treino especial",
      text: "Treino especial no sábado às 10h.",
      target: "Todas as turmas",
      date: "23/09/2026",
    },
  ],
  attendance: [],
  classes: [
    { name: "Adultos — Iniciante", day: "Segunda e quarta", time: "19:00" },
    { name: "Adultos — Avançado", day: "Terça e quinta", time: "20:30" },
    { name: "Infantil", day: "Quarta", time: "18:00" },
    { name: "Competição", day: "Sexta", time: "19:00" },
  ],
  settings: {
    fee: 100,
    name: "Liga Garra de Águia Pirituba",
    phone: "(11) 99999-9999",
    addr: "Pirituba — São Paulo/SP",
  },
};
let db;
try {
  db = JSON.parse(localStorage.getItem(KEY));
} catch {
  db = null;
}
db = db || structuredClone(seed);
db.settings = { ...seed.settings, ...db.settings };
const save = () => localStorage.setItem(KEY, JSON.stringify(db));

let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}
function openModal(html) {
  $("modalContent").innerHTML = html;
  $("modal").classList.remove("hidden");
  $("modalContent").querySelector("input,select")?.focus();
}
const closeModal = () => $("modal").classList.add("hidden");
$("closeModal").onclick = closeModal;
$("modal").onclick = (e) => {
  if (e.target === $("modal")) closeModal();
};
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* Navegação */
const pages = {
  dashboard: "Dashboard",
  alunos: "Alunos",
  frequencia: "Frequência",
  turmas: "Turmas e aulas",
  graduacoes: "Graduações",
  financeiro: "Financeiro",
  relatorios: "Relatórios",
  avisos: "Avisos",
  config: "Configurações",
};
function showPage(id) {
  document
    .querySelectorAll(".page")
    .forEach((x) => x.classList.toggle("active", x.id === id));
  document
    .querySelectorAll(".nav")
    .forEach((x) => x.classList.toggle("active", x.dataset.page === id));
  $("pageTitle").textContent = pages[id];
  ({
    dashboard: renderDash,
    alunos: renderStudents,
    frequencia: renderAttendance,
    turmas: renderClasses,
    graduacoes: renderBelts,
    financeiro: renderFinanceiro,
    avisos: renderNotices,
    config: renderConfig,
  })[id]?.();
  scrollTo({ top: 0 });
}
document
  .querySelectorAll(".nav")
  .forEach((x) => (x.onclick = () => showPage(x.dataset.page)));
document
  .querySelectorAll("[data-go]")
  .forEach((x) => (x.onclick = () => showPage(x.dataset.go)));
$("notifyBtn").onclick = () => showPage("avisos");

/* Login demonstrativo: validação no navegador não protege dados.
   Para produção, substituir por API com sessão validada no servidor. */
function enterApp() {
  $("loginScreen").classList.add("hidden");
  $("app").classList.remove("hidden");
  showPage("dashboard");
}
$("loginForm").onsubmit = (e) => {
  e.preventDefault();
  if (
    $("loginUser").value.trim() === "professor" &&
    $("loginPass").value === "1234"
  ) {
    sessionStorage.setItem("liga-auth", "1");
    enterApp();
  } else toast("Usuário ou senha incorretos");
};
$("logout").onclick = () => {
  sessionStorage.removeItem("liga-auth");
  window.location.href = "index.html";
};

/* Utilidades de dados */
const activeIn = (cls) =>
  db.students.filter((s) => s.active && s.turma === cls).length;
const sum = (status) =>
  db.payments
    .filter((p) => p.status === status)
    .reduce((a, p) => a + p.value, 0);
const nextBelt = (id) => {
  const s = db.students.find((x) => x.id === id);
  return BELTS[Math.min(BELTS.indexOf(s.belt) + 1, BELTS.length - 1)];
};
function fillClassSelects() {
  const names = db.classes.map((c) => c.name);
  const keep = $("attClass").value;
  $("attClass").innerHTML = names
    .map((n) => `<option>${esc(n)}</option>`)
    .join("");
  if (names.includes(keep)) $("attClass").value = keep;
  $("noticeTarget").innerHTML = ["Todas as turmas", ...names]
    .map((n) => `<option>${esc(n)}</option>`)
    .join("");
}
function applySettings() {
  $("gymName").textContent = db.settings.name;
  document.title = db.settings.name + " — Gestão";
  $("notifyDot").style.display = db.notices.length ? "" : "none";
}

/* Dashboard */
function renderDash() {
  const active = db.students.filter((s) => s.active);
  $("statStudents").textContent = active.length;
  $("statClasses").textContent = db.classes.length;
  $("statAttendance").textContent =
    (active.length
      ? Math.round(active.reduce((a, s) => a + s.attendance, 0) / active.length)
      : 0) + "%";
  $("statPending").textContent = money(sum("pending"));
  $("nextLessons").innerHTML =
    db.classes
      .slice(0, 4)
      .map(
        (c) =>
          `<div class="lesson"><b>${esc(c.day)}, ${esc(c.time)}</b><small>${esc(c.name)} — ${activeIn(c.name)} alunos</small></div>`,
      )
      .join("") || `<p class="empty">Nenhuma turma cadastrada.</p>`;
  $("recentStudents").innerHTML =
    active
      .slice(-4)
      .reverse()
      .map(
        (s) =>
          `<div class="recent"><span>${esc(s.name)}</span><span class="muted">Faixa ${esc(s.belt)}</span></div>`,
      )
      .join("") || `<p class="empty">Nenhum aluno ativo.</p>`;
  $("financeSummary").innerHTML =
    `<div class="recent"><span>Recebido</span><b class="green">${money(sum("paid"))}</b></div><div class="recent"><span>Pendente</span><b class="red">${money(sum("pending"))}</b></div>`;
  applySettings();
}
$("qStudent").onclick = () => {
  showPage("alunos");
  editStudent(0);
};
$("qPay").onclick = () => {
  showPage("financeiro");
  paymentForm();
};

/* Alunos */
function renderStudents() {
  const q = $("studentSearch").value.toLowerCase(),
    f = $("studentFilter").value;
  const arr = db.students.filter(
    (s) =>
      (f === "all" || (f === "active" ? s.active : !s.active)) &&
      `${s.name} ${s.phone} ${s.email}`.toLowerCase().includes(q),
  );
  $("studentTable").innerHTML =
    arr
      .map(
        (s) =>
          `<tr><td><b>${esc(s.name)}</b><br><small>Desde ${esc(s.joined)}</small></td><td>${esc(s.phone)}<br><small>${esc(s.email)}</small></td><td>${esc(s.turma)}</td><td>${esc(s.belt)}</td><td><span class="pill ${s.active ? "" : "red"}">${s.active ? "Ativo" : "Inativo"}</span></td><td><button class="action" data-act="view" data-id="${s.id}">Ver</button><button class="action" data-act="edit" data-id="${s.id}">Editar</button><button class="action" data-act="toggle" data-id="${s.id}">${s.active ? "Inativar" : "Ativar"}</button></td></tr>`,
      )
      .join("") ||
    `<tr><td colspan="6" class="empty">Nenhum aluno encontrado.</td></tr>`;
}
$("studentSearch").oninput = renderStudents;
$("studentFilter").onchange = renderStudents;
$("studentTable").onclick = (e) => {
  const b = e.target.closest("button");
  if (b)
    ({ view: viewStudent, edit: editStudent, toggle: toggleStudent })[
      b.dataset.act
    ](+b.dataset.id);
};
$("addStudent").onclick = () => editStudent(0);
function viewStudent(id) {
  const s = db.students.find((x) => x.id === id);
  openModal(
    `<h2>${esc(s.name)}</h2><p class="info">${esc(s.turma)} — faixa ${esc(s.belt)} — ${s.active ? "ativo" : "inativo"}</p><div class="stats"><div class="card stat"><b>${s.attendance}%</b><small>Frequência</small></div><div class="card stat"><b>${esc(s.belt)}</b><small>Graduação atual</small></div></div><p class="info">Telefone: ${esc(s.phone)}</p><p class="info">E-mail: ${esc(s.email)}</p><p class="info">Aluno desde ${esc(s.joined)}</p><br><button class="primary full" onclick="editStudent(${id})">Editar cadastro</button>`,
  );
}
function editStudent(id) {
  const s = id
    ? db.students.find((x) => x.id === id)
    : {
        name: "",
        phone: "",
        email: "",
        turma: db.classes[0]?.name || "",
        belt: "Branca",
        attendance: 100,
      };
  const names = db.classes.map((c) => c.name);
  if (s.turma && !names.includes(s.turma)) names.push(s.turma);
  openModal(
    `<h2>${id ? "Editar cadastro" : "Cadastrar aluno"}</h2><div class="form-grid"><label class="wide">Nome<input id="fName" value="${esc(s.name)}"></label><label>Telefone<input id="fPhone" value="${esc(s.phone)}" placeholder="(11) 90000-0000"></label><label>E-mail<input id="fEmail" type="email" value="${esc(s.email)}"></label><label>Turma<select id="fClass">${names.map((n) => `<option ${n === s.turma ? "selected" : ""}>${esc(n)}</option>`).join("")}</select></label><label>Faixa<select id="fBelt">${BELTS.map((b) => `<option ${b === s.belt ? "selected" : ""}>${b}</option>`).join("")}</select></label></div><button class="primary full" onclick="saveStudent(${id || 0})">Salvar aluno</button>`,
  );
}
function saveStudent(id) {
  const name = $("fName").value.trim();
  if (!name) return toast("Informe o nome do aluno");
  const data = {
    name,
    phone: $("fPhone").value.trim(),
    email: $("fEmail").value.trim(),
    turma: $("fClass").value,
    belt: $("fBelt").value,
  };
  if (id)
    Object.assign(
      db.students.find((s) => s.id === id),
      data,
    );
  else
    db.students.push({
      id: Date.now(),
      ...data,
      active: true,
      joined: today(),
      attendance: 100,
      lastGrad: today(),
    });
  save();
  closeModal();
  renderStudents();
  renderDash();
  toast("Aluno salvo");
}
function toggleStudent(id) {
  const s = db.students.find((x) => x.id === id);
  s.active = !s.active;
  save();
  renderStudents();
  renderDash();
  toast(s.active ? "Aluno ativado" : "Aluno inativado");
}

/* Frequência */
function updateAtt() {
  const boxes = [...document.querySelectorAll("#attendanceList input")];
  boxes.forEach((b) => {
    const st = b.closest("label").lastElementChild;
    st.textContent = b.checked ? "Presente" : "Ausente";
    st.className = b.checked ? "green" : "red";
  });
  $("attCounter").textContent =
    `${boxes.filter((b) => b.checked).length}/${boxes.length}`;
}
function renderAttendance() {
  fillClassSelects();
  if (!$("attDate").value) $("attDate").value = isoToday();
  const cls = $("attClass").value,
    date = $("attDate").value;
  const arr = db.students.filter((s) => s.active && s.turma === cls);
  const rec = db.attendance.find((a) => a.date === date && a.class === cls);
  $("attInfo").textContent = rec
    ? "Chamada já registrada — você pode editar"
    : "Marque os alunos presentes";
  $("attendanceList").innerHTML =
    arr
      .map(
        (s) =>
          `<div class="attendance-row"><label><span class="who"><input type="checkbox" data-id="${s.id}" ${rec?.present.includes(s.id) ? "checked" : ""}><b>${esc(s.name)}</b></span><span></span></label></div>`,
      )
      .join("") || `<p class="empty">Nenhum aluno ativo nesta turma.</p>`;
  updateAtt();
}
$("attClass").onchange = $("attDate").onchange = renderAttendance;
$("attendanceList").onchange = updateAtt;
$("markAll").onclick = () => {
  const boxes = [...document.querySelectorAll("#attendanceList input")];
  const all = boxes.every((b) => b.checked);
  boxes.forEach((b) => (b.checked = !all));
  updateAtt();
};
$("saveAttendance").onclick = () => {
  const cls = $("attClass").value,
    date = $("attDate").value;
  if (!date || !document.querySelector("#attendanceList input"))
    return toast("Nada para salvar");
  const present = [
    ...document.querySelectorAll("#attendanceList input:checked"),
  ].map((x) => +x.dataset.id);
  db.attendance = db.attendance.filter(
    (a) => !(a.date === date && a.class === cls),
  );
  db.attendance.push({ date, class: cls, present });
  db.students.forEach((s) => {
    const sessions = db.attendance.filter((a) => a.class === s.turma);
    if (sessions.length)
      s.attendance = Math.round(
        (sessions.filter((a) => a.present.includes(s.id)).length /
          sessions.length) *
          100,
      );
  });
  save();
  renderDash();
  $("attInfo").textContent = "Chamada já registrada — você pode editar";
  toast(`Chamada salva: ${present.length} presentes`);
};
$("loadHistory").onclick = () => {
  $("attendanceHistory").classList.remove("hidden");
  $("historyList").innerHTML =
    db.attendance
      .slice(-8)
      .reverse()
      .map(
        (a) =>
          `<div class="recent"><span>${brDate(a.date)} — ${esc(a.class)}</span><b class="green">${a.present.length} presentes</b></div>`,
      )
      .join("") || `<p class="empty">Nenhuma chamada registrada.</p>`;
};
$("closeHistory").onclick = () =>
  $("attendanceHistory").classList.add("hidden");

/* Turmas */
function renderClasses() {
  $("classGrid").innerHTML =
    db.classes
      .map(
        (c, i) =>
          `<div class="card class-card"><h3>${esc(c.name)}</h3><p>${esc(c.day)}, ${esc(c.time)}</p><b>${activeIn(c.name)} alunos</b><button class="action" onclick="classForm(${i})">Editar</button><button class="action danger" onclick="deleteClass(${i})">Excluir</button></div>`,
      )
      .join("") || `<p class="empty">Nenhuma turma cadastrada.</p>`;
  const todayIdx = (new Date().getDay() + 6) % 7;
  $("week").innerHTML = DAYS.map(
    (d, i) =>
      `<div class="day ${i === todayIdx ? "today" : ""}"><strong>${d.slice(0, 3)}</strong>${db.classes
        .filter((c) =>
          c.day.toLowerCase().includes(d.slice(0, 3).toLowerCase()),
        )
        .sort((a, b) => a.time.localeCompare(b.time))
        .map((c) => `<div class="event">${esc(c.time)}<br>${esc(c.name)}</div>`)
        .join("")}</div>`,
  ).join("");
  const m = new Date().toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  $("monthLabel").textContent = m[0].toUpperCase() + m.slice(1);
}
function classForm(i) {
  const c = db.classes[i] || { name: "", day: "", time: "19:00" };
  openModal(
    `<h2>${db.classes[i] ? "Editar turma" : "Nova turma"}</h2><div class="form-grid"><label class="wide">Nome da turma<input id="cName" value="${esc(c.name)}"></label><label>Dias<input id="cDay" value="${esc(c.day)}" placeholder="Segunda e quarta"></label><label>Horário<input id="cTime" type="time" value="${esc(c.time)}"></label></div><button class="primary full" onclick="saveClass(${db.classes[i] ? i : -1})">Salvar turma</button>`,
  );
}
function saveClass(i) {
  const c = {
    name: $("cName").value.trim(),
    day: $("cDay").value.trim(),
    time: $("cTime").value,
  };
  if (!c.name || !c.day || !c.time)
    return toast("Preencha nome, dias e horário");
  if (i >= 0) {
    const old = db.classes[i].name;
    db.students.forEach((s) => {
      if (s.turma === old) s.turma = c.name;
    });
    db.attendance.forEach((a) => {
      if (a.class === old) a.class = c.name;
    });
    db.classes[i] = c;
  } else db.classes.push(c);
  save();
  closeModal();
  fillClassSelects();
  renderClasses();
  renderDash();
  toast("Turma salva");
}
$("addClass").onclick = () => classForm(-1);
function deleteClass(i) {
  const n = db.classes[i].name;
  if (activeIn(n))
    return toast("Mova os alunos ativos para outra turma antes de excluir");
  if (!confirm(`Excluir a turma "${n}"?`)) return;
  db.classes.splice(i, 1);
  save();
  fillClassSelects();
  renderClasses();
  renderDash();
  toast("Turma excluída");
}

/* Graduações */
function renderBelts() {
  const f = $("beltFilter").value;
  let arr = db.students;
  if (f === "pending")
    arr = arr.filter(
      (s) => s.active && s.belt !== "Preta" && s.attendance >= 80,
    );
  else if (f !== "all") arr = arr.filter((s) => s.belt === f);
  $("beltTable").innerHTML =
    arr
      .map((s) => {
        const ok = s.belt === "Preta" || s.attendance >= 80;
        return `<tr><td><b>${esc(s.name)}</b></td><td>${esc(s.belt)}</td><td>${esc(s.lastGrad || s.joined)}</td><td>${s.attendance}%</td><td><span class="pill ${ok ? "" : "red"}">${s.belt === "Preta" ? "Faixa preta" : ok ? "Apto" : "Precisa melhorar"}</span></td></tr>`;
      })
      .join("") ||
    `<tr><td colspan="5" class="empty">Nenhum aluno neste filtro.</td></tr>`;
}
$("beltFilter").onchange = renderBelts;
$("promote").onclick = () => {
  const list = db.students.filter((s) => s.active);
  if (!list.length) return toast("Cadastre um aluno primeiro");
  openModal(
    `<h2>Registrar graduação</h2><div class="form-grid"><label class="wide">Aluno<select id="gStu" onchange="$('gBelt').value=nextBelt(+this.value)">${list.map((s) => `<option value="${s.id}">${esc(s.name)} — faixa ${esc(s.belt)}</option>`).join("")}</select></label><label class="wide">Nova faixa<select id="gBelt">${BELTS.map((b) => `<option>${b}</option>`).join("")}</select></label></div><button class="primary full" onclick="savePromotion()">Confirmar graduação</button>`,
  );
  $("gBelt").value = nextBelt(list[0].id);
};
function savePromotion() {
  const s = db.students.find((x) => x.id === +$("gStu").value);
  s.belt = $("gBelt").value;
  s.lastGrad = today();
  save();
  closeModal();
  renderBelts();
  toast(`${s.name} agora é faixa ${s.belt}`);
}

/* Financeiro */
function renderFinanceiro() {
  const paid = sum("paid"),
    pending = sum("pending");
  $("paidTotal").textContent = money(paid);
  $("pendingTotal").textContent = money(pending);
  $("payRate").textContent =
    Math.round((paid / (paid + pending || 1)) * 100) + "%";
  const q = $("financeSearch").value.toLowerCase(),
    f = $("financeFilter").value;
  $("financeTable").innerHTML =
    db.payments
      .filter(
        (p) =>
          (f === "all" || p.status === f) &&
          p.student.toLowerCase().includes(q),
      )
      .map(
        (p) =>
          `<tr><td>${esc(p.student)}</td><td>${money(p.value)}</td><td>${esc(p.due)}</td><td><span class="pill ${p.status === "paid" ? "" : "red"}">${p.status === "paid" ? "Pago" : "Pendente"}</span></td><td><button class="action" data-act="toggle" data-id="${p.id}">${p.status === "paid" ? "Marcar pendente" : "Marcar pago"}</button><button class="action danger" data-act="del" data-id="${p.id}">Excluir</button></td></tr>`,
      )
      .join("") ||
    `<tr><td colspan="5" class="empty">Nenhum pagamento encontrado.</td></tr>`;
}
$("financeSearch").oninput = renderFinanceiro;
$("financeFilter").onchange = renderFinanceiro;
$("financeTable").onclick = (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const id = +b.dataset.id,
    p = db.payments.find((x) => x.id === id);
  if (b.dataset.act === "toggle") {
    p.status = p.status === "paid" ? "pending" : "paid";
    toast("Pagamento atualizado");
  } else if (confirm("Excluir este lançamento?")) {
    db.payments = db.payments.filter((x) => x.id !== id);
    toast("Lançamento excluído");
  } else return;
  save();
  renderFinanceiro();
  renderDash();
};
function paymentForm() {
  const list = db.students.filter((s) => s.active);
  if (!list.length) return toast("Cadastre um aluno primeiro");
  openModal(
    `<h2>Registrar pagamento</h2><div class="form-grid"><label class="wide">Aluno<select id="pStu">${list.map((s) => `<option>${esc(s.name)}</option>`).join("")}</select></label><label>Valor (R$)<input id="pVal" type="number" min="0" step="0.01" value="${db.settings.fee}"></label><label>Vencimento<input id="pDue" type="date" value="${isoToday()}"></label><label class="wide">Situação<select id="pStatus"><option value="paid">Pago</option><option value="pending">Pendente</option></select></label></div><button class="primary full" onclick="savePayment()">Salvar pagamento</button>`,
  );
}
function savePayment() {
  const value = Number($("pVal").value);
  if (!(value > 0) || !$("pDue").value)
    return toast("Informe valor e vencimento");
  db.payments.push({
    id: Date.now(),
    student: $("pStu").value,
    value,
    due: brDate($("pDue").value),
    status: $("pStatus").value,
  });
  save();
  closeModal();
  renderFinanceiro();
  renderDash();
  toast("Pagamento registrado");
}
$("newPayment").onclick = paymentForm;

/* Relatórios */
const reports = {
  Frequência: () => ({
    head: ["Aluno", "Turma", "Frequência"],
    rows: db.students
      .filter((s) => s.active)
      .map((s) => [s.name, s.turma, s.attendance + "%"]),
  }),
  Financeiro: () => ({
    head: ["Aluno", "Valor", "Vencimento", "Situação"],
    rows: db.payments.map((p) => [
      p.student,
      money(p.value),
      p.due,
      p.status === "paid" ? "Pago" : "Pendente",
    ]),
  }),
  Graduações: () => ({
    head: ["Aluno", "Faixa", "Última graduação", "Situação"],
    rows: db.students.map((s) => [
      s.name,
      s.belt,
      s.lastGrad || s.joined,
      s.belt === "Preta"
        ? "Faixa preta"
        : s.attendance >= 80
          ? "Apto"
          : "Precisa melhorar",
    ]),
  }),
  Alunos: () => ({
    head: ["Aluno", "Telefone", "E-mail", "Turma", "Faixa", "Status"],
    rows: db.students.map((s) => [
      s.name,
      s.phone,
      s.email,
      s.turma,
      s.belt,
      s.active ? "Ativo" : "Inativo",
    ]),
  }),
};
let lastReport;
document.querySelectorAll("[data-report]").forEach(
  (b) =>
    (b.onclick = () => {
      const type = b.dataset.report,
        r = reports[type]();
      lastReport = { type, ...r };
      $("reportOutput").innerHTML =
        `<h3>Relatório de ${type}</h3><p class="muted">${r.rows.length} registros — gerado em ${today()}</p><div class="table-wrap"><table><thead><tr>${r.head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${r.rows.map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div><div class="report-actions"><button class="primary" onclick="window.print()">Imprimir ou salvar PDF</button><button class="secondary" onclick="downloadCSV()">Baixar planilha (CSV)</button></div>`;
    }),
);
function downloadCSV() {
  const csv =
    "\ufeff" +
    [lastReport.head, ...lastReport.rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  a.download = `relatorio-${lastReport.type.toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* Avisos */
function renderNotices() {
  fillClassSelects();
  $("noticeList").innerHTML =
    db.notices
      .map(
        (n, i) =>
          `<div class="notice"><b>${esc(n.title)}</b><p>${esc(n.text)}</p><small>${esc(n.target)} — ${esc(n.date)}</small> <button class="link" onclick="deleteNotice(${i})">Remover</button></div>`,
      )
      .reverse()
      .join("") || `<p class="empty">Nenhum aviso publicado.</p>`;
}
$("sendNotice").onclick = () => {
  const title = $("noticeTitle").value.trim(),
    text = $("noticeText").value.trim();
  if (!title || !text) return toast("Preencha título e mensagem");
  db.notices.push({
    title,
    text,
    target: $("noticeTarget").value,
    date: today(),
  });
  save();
  $("noticeTitle").value = $("noticeText").value = "";
  renderNotices();
  applySettings();
  toast("Aviso publicado");
};
function deleteNotice(i) {
  db.notices.splice(i, 1);
  save();
  renderNotices();
  applySettings();
  toast("Aviso removido");
}

/* Configurações */
function renderConfig() {
  const s = db.settings;
  $("cfgName").value = s.name;
  $("cfgPhone").value = s.phone;
  $("cfgAddr").value = s.addr;
  $("cfgFee").value = s.fee;
}
$("saveConfig").onclick = () => {
  db.settings = {
    name: $("cfgName").value.trim() || seed.settings.name,
    phone: $("cfgPhone").value.trim(),
    addr: $("cfgAddr").value.trim(),
    fee: Number($("cfgFee").value) || 100,
  };
  save();
  applySettings();
  toast("Configurações salvas");
};

/* Início */
fillClassSelects();
applySettings();
if (sessionStorage.getItem("liga-auth")) enterApp();
