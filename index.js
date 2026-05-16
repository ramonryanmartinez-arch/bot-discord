const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

// 🐾 IMPORTA OS PETS
const pets = require("./pets");

// 🌐 SERVIDOR EXPRESS (OBRIGATÓRIO NO RENDER)
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

// 🧠 PEGA VALOR DO PET
function getPetValue(name) {
  return pets[name.toLowerCase().trim()] || -1;
}

// 📩 MENSAGENS
client.on("messageCreate", (message) => {

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

    // SOMA LADO 1
    for (let p of lado1) {

      const valor = getPetValue(p);

      if (valor === -1) {
        return message.reply(`❌ Pet não encontrado: ${p}`);
      }

      total1 += valor;
    }

    // SOMA LADO 2
    for (let p of lado2) {

      const valor = getPetValue(p);

      if (valor === -1) {
        return message.reply(`❌ Pet não encontrado: ${p}`);
      }

      total2 += valor;
    }

    // RESULTADO
    let resultado =
      total2 > total1
        ? "WIN 🟢"
        : total2 < total1
        ? "LOSE 🔴"
        : "FAIR ⚖️";

    return message.reply(
      `📊 TRADE RESULTADO\n\n` +
      `Seu lado: ${parts[0]} = ${total1}\n` +
      `Outro lado: ${parts[1]} = ${total2}\n\n` +
      `${resultado}`
    );
  }

  // 📊 /painel
  if (message.content === "/paineldo7") {

    const lista = Object.entries(pets)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    let texto = "📊 TOP PETS MAIS VALIOSOS\n\n";

    for (let i = 0; i < lista.length; i++) {

      texto +=
        `${i + 1}. ${lista[i][0]} = ${lista[i][1]}\n`;

    }

    return message.reply(texto);
  }

});

// 🤖 ONLINE
client.once("clientReady", () => {
  console.log(`Bot online como ${client.user.tag}`);
});

// 🔑 LOGIN
client.login(process.env.DISCORD_TOKEN);
