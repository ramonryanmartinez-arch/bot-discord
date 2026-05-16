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

// 🧠 PEGA VALOR COM MUTAÇÃO
function getPetValue(nomeCompleto) {

  const nomeLower = nomeCompleto.toLowerCase();

  let multiplicador = 1;

  let nomePet = nomeLower;

  for (let mutacao in mutacoesPele) {

    if (nomeLower.includes(mutacao)) {

      multiplicador = mutacoesPele[mutacao];

      nomePet = nomeLower.replace(mutacao, "").trim();
    }
  }

  const valorBase = pets[nomePet];

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

    // 🧠 RESULTADO
    let resultado = "FAIR ⚖️";

    if (total2 > total1) {
      resultado = "WIN 🟢";
    }

    else if (total2 < total1) {
      resultado = "LOSE 🔴";
    }

    // 📤 RESPOSTA
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
