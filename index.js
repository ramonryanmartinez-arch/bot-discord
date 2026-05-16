const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

// 🐾 PETS
const pets = require("./pets");

// 🧬 MUTAÇÕES DE PELE
const mutacoesPele = {

  "bloodroot": 2,
  "candy": 3,
  "lava": 6,
  "galaxy": 7,
  "radioativa": 7.5,
  "ying yang": 8.5,
  "cursed": 9.5,
  "divina": 10,
  "cyber": 11,
  "gold": 1.25,
  "diamante": 1.75,
  "rainbow": 10

};

// 🎭 MUTAÇÕES DE CORPO
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

  // 🔻 TIRAM 25%
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

// 🌐 EXPRESS
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot online");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// 🤖 CLIENTE DISCORD
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🧠 CALCULAR VALOR COM MUTAÇÕES
function getPetValue(nomeCompleto) {

  let nome = nomeCompleto.toLowerCase();

  let multiplicador = 1;

  // 🧬 PELE
  for (let mutacao in mutacoesPele) {

    if (nome.includes(mutacao)) {

      multiplicador *= mutacoesPele[mutacao];

      nome = nome.replace(mutacao, "").trim();
    }
  }

  // 🎭 CORPO
  for (let mutacao in mutacoesCorpo) {

    if (nome.includes(mutacao)) {

      multiplicador *= mutacoesCorpo[mutacao];

      nome = nome.replace(mutacao, "").trim();
    }
  }

  const valorBase = pets[nome];

  if (!valorBase) return -1;

  return Math.floor(valorBase * multiplicador);
}

// 📩 COMANDOS
client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  // 📊 /avaliar
  if (message.content.startsWith("/avaliar")) {

    const parts = message.content
      .replace("/avaliar", "")
      .trim()
      .split(" vs ");

    if (parts.length !== 2) {

      return message.reply(
        "Use: /avaliar pet + pet vs pet + pet"
      );
    }

    const lado1 = parts[0]
      .split("+")
      .map(p => p.trim());

    const lado2 = parts[1]
      .split("+")
      .map(p => p.trim());

    let total1 = 0;
    let total2 = 0;

    // 🟢 SOMA LADO 1
    for (let p of lado1) {

      const valor = getPetValue(p);

      if (valor === -1) {

        return message.reply(
          `❌ Pet não encontrado: ${p}`
        );
      }

      total1 += valor;
    }

    // 🔵 SOMA LADO 2
    for (let p of lado2) {

      const valor = getPetValue(p);

      if (valor === -1) {

        return message.reply(
          `❌ Pet não encontrado: ${p}`
        );
      }

      total2 += valor;
    }

    // 📊 RESULTADO
    let resultado = "FAIR ⚖️";

    if (total2 > total1) {
      resultado = "WIN 🟢";
    }

    else if (total2 < total1) {
      resultado = "LOSE 🔴";
    }

    return message.reply(

      `📊 TRADE RESULTADO\n\n` +

      `Seu lado:\n${parts[0]}\n💰 ${total1}\n\n` +

      `Outro lado:\n${parts[1]}\n💰 ${total2}\n\n` +

      `${resultado}`
    );
  }

  // 📊 /painel
  if (message.content === "/painel") {

    const lista = Object.entries(pets)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    let texto =
      "📊 TOP PETS MAIS VALIOSOS\n\n";

    for (let i = 0; i < lista.length; i++) {

      texto +=
        `${i + 1}. ${lista[i][0]} = ${lista[i][1]}\n`;
    }

    return message.reply(texto);
  }

});

// 🤖 ONLINE
client.once("clientReady", () => {

  console.log(
    `Bot online como ${client.user.tag}`
  );
});

// 🔑 LOGIN
client.login(process.env.DISCORD_TOKEN);
