const express = require("express");
const fs = require("fs");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

// 🐾 PETS
const pets = require("./pets");

// =========================
// 📦 DATABASE
// =========================

const DB_FILE = "./db.json";

function loadDB() {
  if (!fs.existsSync(DB_FILE)) return {};
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// =========================
// 🧬 MUTAÇÕES DE PELE
// =========================

const mutacoesPele = {
  bloodroot: 2,
  candy: 3,
  lava: 6,
  galaxy: 7,
  radioativa: 7.5,
  "ying yang": 8.5,
  cursed: 9.5,
  divina: 10,
  cyber: 11,
  gold: 1.25,
  diamante: 1.75,
  rainbow: 10
};

// =========================
// 🎭 MUTAÇÕES DE CORPO (COMPLETA)
// =========================

const mutacoesCorpo = {

  "morango": 9,
  "meowl": 8,
  "john pork": 7.5,
  "skibidi": 7,
  "rena": 6,
  "chocolate": 5.5,
  "26": 6,
  "halo": 6,
  "sorte": 6,
  "abóbora pet": 5.5,
  "orelhas de coelho": 5.5,
  "gorro de papai noel": 5,
  "lápide rip": 4.5,
  "hora da bruxa": 4,
  "esqueleto": 4,
  "10b": 4,
  "balão laranja": 4,
  "balão verde": 4.5,
  "balão azul": 5,
  "balão vermelho": 6,
  "balão rosa": 6.5,
  "balão arco-íris": 7.5,
  "ovo laranja": 4,
  "ovo verde": 5,
  "ovo azul": 5.5,
  "ovo rosa": 7.5,
  "paint": 6,
  "pintura": 6,
  ":3": 5.5,
  "gravata": 4.75,
  "aranha": 4.5,
  "chapéu matteo": 4.5,
  "galáctico": 4,
  "explosivo": 4,
  "barbatana de tubarão": 4,
  "brasil": 6,
  "indonésia": 5,
  "sombrero": 5,
  "vovó": 6.5,
  "fogo": 6,
  "rosas": 6,
  "fogos de artifício": 6,
  "nyan": 6,
  "relâmpago": 6,
  "disco": 5,
  "glitchado": 5,

  "garra de caranguejo": 0.75,
  "taco": 0.75,

  "zumbi": 5,
  "chiclete": 4,
  "bubblegum": 4,
  "ovni": 3,
  "sonolento": 0.5,
  "atingido por cometa": 3.5,
  "neve": 3,
  "molhado": 2.5

};

// =========================
// 💰 CALCULO DE VALOR
// =========================

function getPetValue(nomeCompleto) {
  let nome = nomeCompleto.toLowerCase();
  let mult = 1;

  for (let m in mutacoesPele) {
    if (nome.includes(m)) {
      mult *= mutacoesPele[m];
      nome = nome.replace(m, "").trim();
    }
  }

  for (let m in mutacoesCorpo) {
    if (nome.includes(m)) {
      mult *= mutacoesCorpo[m];
      nome = nome.replace(m, "").trim();
    }
  }

  const base = pets[nome];
  if (!base) return -1;

  return Math.floor(base * mult);
}

// =========================
// 🌐 EXPRESS
// =========================

const app = express();
app.get("/", (req, res) => res.send("Bot online"));
app.listen(process.env.PORT || 3000);

// =========================
// 🤖 DISCORD BOT
// =========================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`Bot online como ${client.user.tag}`);
});

// =========================
// 📩 COMANDOS
// =========================

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const db = loadDB();

  // 📦 ADD PET
  if (message.content.startsWith("/addpet")) {
    const args = message.content.split(" ").slice(1);

    const pet = args[0]?.toLowerCase();
    const qtd = parseInt(args[1] || "1");

    if (!pet) return message.reply("Use: /addpet nome quantidade");

    if (!db[message.author.id]) db[message.author.id] = {};
    if (!db[message.author.id][pet]) db[message.author.id][pet] = 0;

    db[message.author.id][pet] += qtd;

    saveDB(db);

    return message.reply(`✅ Adicionado ${qtd}x ${pet}`);
  }

  // 🔎 PROCURAR
  if (message.content.startsWith("/procurar")) {
    const pet = message.content.split(" ").slice(1).join(" ").toLowerCase();

    if (!pet) return message.reply("Use: /procurar nome");

    let encontrados = [];

    for (let user in db) {
      if (db[user][pet]) {
        encontrados.push(`👤 <@${user}> → ${db[user][pet]}x`);
      }
    }

    if (encontrados.length === 0) {
      return message.reply("❌ Ninguém possui esse pet.");
    }

    return message.reply(`🔎 **${pet}**\n\n` + encontrados.join("\n"));
  }

  // 📦 MEUS PETS
  if (message.content === "/meuspets") {
    const user = db[message.author.id];

    if (!user) return message.reply("Você não tem pets.");

    let text = "📦 SEUS PETS:\n\n";

    for (let p in user) {
      text += `• ${p}: ${user[p]}x\n`;
    }

    return message.reply(text);
  }

  // 📊 AVALIAR
  if (message.content.startsWith("/avaliar")) {
    const parts = message.content.replace("/avaliar", "").trim().split(" vs ");

    if (parts.length !== 2) {
      return message.reply("Use: /avaliar pet + pet vs pet + pet");
    }

    const lado1 = parts[0].split("+").map(p => p.trim());
    const lado2 = parts[1].split("+").map(p => p.trim());

    let t1 = 0;
    let t2 = 0;

    for (let p of lado1) {
      const v = getPetValue(p);
      if (v === -1) return message.reply(`❌ Não existe: ${p}`);
      t1 += v;
    }

    for (let p of lado2) {
      const v = getPetValue(p);
      if (v === -1) return message.reply(`❌ Não existe: ${p}`);
      t2 += v;
    }

    const diff = Math.abs(t1 - t2);
    const media = (t1 + t2) / 2;
    const percent = diff / media;

    let resultado = "";

    if (percent <= 0.05) {
      resultado = "⚖️ justa";
    } else if (percent <= 0.15) {
      resultado = t2 > t1 ? "🟠 Ganha um pouco" : "🔴 Perde um pouco";
    } else {
      resultado = t2 > t1 ? "❌️ Você sai ganhando" : "❌️ Você sai perdendo";
    }

    const embed = new EmbedBuilder()
      .setTitle("📊 Trade Result")
      .addFields(
        { name: "Seu lado", value: `${parts[0]}\n💰 ${t1}`, inline: false },
        { name: "Outro lado", value: `${parts[1]}\n💰 ${t2}`, inline: false },
        { name: "Resultado", value: resultado, inline: false }
      )
      .setColor(0x00bfff);

    return message.reply({ embeds: [embed] });
  }

  // 📊 PAINEL
  if (message.content === "/painel") {
    const top = Object.entries(pets)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    let text = "📊 TOP PETS\n\n";

    top.forEach((p, i) => {
      text += `${i + 1}. ${p[0]} → ${p[1]}\n`;
    });

    return message.reply(text);
  }
});

// =========================
// LOGIN
// =========================

client.login(process.env.DISCORD_TOKEN);
