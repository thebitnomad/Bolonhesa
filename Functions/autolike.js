const chalk = require("chalk");

async function autolike(client, message) {
  try {
    const { key, message: msg } = message;
    const remoteJid = key.remoteJid;

    // Ignorar mensagens que não são status ou mensagens de protocolo
    if (remoteJid !== "status@broadcast" || !key.id || msg.protocolMessage) {
      return;
    }

    // Log do processamento do status
    console.log(chalk.blue(`Processando status ${key.id}, Key:`, JSON.stringify(key, null, 2)));

    // Reagir com ❤️
    const reactionResult = await client.sendMessage(remoteJid, {
      react: { key, text: "❤️" },
    });
    console.log(
      chalk.blue(
        `Reagi com ❤️ ao status ${key.id}, Resultado:`,
        JSON.stringify(reactionResult, null, 2)
      )
    );

    // Visualizar status (marcar como lido)
    await client.readMessages([key]);
    console.log(chalk.blue(`Status ${key.id} visualizado`));
  } catch (error) {
    console.error(chalk.red(`Erro no autolike para o status ${message.key.id}:`, error));

    // Método alternativo de reação
    try {
      await client.sendMessage(message.key.remoteJid, {
        reactionMessage: { key: message.key, text: "❤️" },
      });
      console.log(chalk.blue(`Reação alternativa enviada para o status ${message.key.id}`));
    } catch (fallbackError) {
      console.error(
        chalk.red(`Falha na reação alternativa para o status ${message.key.id}:`, fallbackError)
      );
    }
  }
}

module.exports = autolike;
