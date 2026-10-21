/* CONFIGURAÇÃO PÚBLICA: preencher somente com dados reais da escola.
   Não ler dados de alunos, financeiro ou credenciais do painel nesta página. */
const PUBLIC_CONFIG = {
  whatsapp: "5511961708742", // DDI + DDD + número, apenas dígitos
  endereco: "",
  horarios: [
    { turma: "Adultos — Iniciante", dias: "Segunda e Quarta", hora: "19:00" },
    { turma: "Adultos — Avançado", dias: "Terça e Quinta", hora: "20:30" },
    { turma: "Infantil", dias: "Quarta", hora: "18:00" },
    { turma: "Competição", dias: "Sexta", hora: "19:00" },
  ],
};
const byId = (id) => document.getElementById(id);
byId("year").textContent = new Date().getFullYear();

// Horários
PUBLIC_CONFIG.horarios.forEach((item) => {
  const row = document.createElement("div");
  row.className = "schedule-row";
  const name = document.createElement("strong");
  name.textContent = item.turma;
  const details = document.createElement("span");
  details.textContent = item.dias;
  const time = document.createElement("b");
  time.textContent = item.hora;
  details.append(time);
  row.append(name, details);
  byId("scheduleRows").append(row);
});

// Endereço e WhatsApp
if (PUBLIC_CONFIG.endereco)
  byId("address").textContent = PUBLIC_CONFIG.endereco;
const phone = PUBLIC_CONFIG.whatsapp.replace(/\D/g, "");
if (phone) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent("Olá! Gostaria de agendar uma aula experimental de Kung-Fu.")}`;
  document.querySelectorAll("[data-whatsapp]").forEach((a) => {
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  });
} else {
  byId("ctaWhats").hidden = true;
}
