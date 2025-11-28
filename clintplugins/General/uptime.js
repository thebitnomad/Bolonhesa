module.exports = async (context) => {
  const { client, m, text, botname } = context;

  if (text) {
    return client.sendMessage(
      m.chat,
      {
        text:
          `◈━━━━━━━━━━━━━━━━◈\n` +
          `│❒ Olá, ${m.pushName}! Este comando não precisa de texto extra.\n` +
          `│❒ Use apenas *!uptime* para verificar há quanto tempo o bot está online.\n` +
          `◈━━━━━━━━━━━━━━━━◈`
      },
      { quoted: m }
    );
  }

  try {
    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);

      const daysDisplay = days > 0 ? `${days} ${days === 1 ? 'dia' : 'dias'}, ` : '';
      const hoursDisplay = hours > 0 ? `${hours} ${hours === 1 ? 'hora' : 'horas'}, ` : '';
      const minutesDisplay = minutes > 0 ? `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}, ` : '';
      const secsDisplay = secs > 0 ? `${secs} ${secs === 1 ? 'segundo' : 'segundos'}` : '';

      return (daysDisplay + hoursDisplay + minutesDisplay + secsDisplay).replace(/,\s*$/, '');
    };

    const uptimeText = formatUptime(process.uptime());

    const replyText =
      `◈━━━━━━━━━━━━━━━━◈\n` +
      `│❒ *Status de uptime de ${botname}*\n` +
      `│❒ Estou online há *${uptimeText}* e funcionando normalmente.\n` +
      `│❒ Powered by *${botname}*\n` +
      `◈━━━━━━━━━━━━━━━━◈`;

    await client.sendMessage(
      m.chat,
      { text: replyText },
      { quoted: m }
    );
  } catch (error) {
    console.error(
      `◈━━━━━━━━━━━━━━━━◈\n` +
      `│❒ Ocorreu um erro ao executar o comando de uptime.\n` +
      `◈━━━━━━━━━━━━━━━━◈\n`,
      error
    );

    await client.sendMessage(
      m.chat,
      {
        text:
          `◈━━━━━━━━━━━━━━━━◈\n` +
          `│❒ Não foi possível verificar o uptime no momento.\n` +
          `│❒ Tente novamente em alguns instantes.\n` +
          `│❒ Powered by *${botname}*\n` +
          `◈━━━━━━━━━━━━━━━━◈`
      },
      { quoted: m }
    );
  }
};
