module.exports = async (context) => {
  const { client, m, text, botname } = context;

  if (text) {
    return client.sendMessage(m.chat, { text: `◈━━━━━━━━━━━━━━━━◈\n│❒ Use apenas !uptime para ver o tempo online, ${m.pushName}.\n◈━━━━━━━━━━━━━━━━◈` }, { quoted: m });
  }

  try {
    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);

      const daysDisplay = days > 0 ? `${days} ${days === 1 ? 'day' : 'days'}, ` : '';
      const hoursDisplay = hours > 0 ? `${hours} ${hours === 1 ? 'hour' : 'hours'}, ` : '';
      const minutesDisplay = minutes > 0 ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}, ` : '';
      const secsDisplay = secs > 0 ? `${secs} ${secs === 1 ? 'second' : 'seconds'}` : '';

      return (daysDisplay + hoursDisplay + minutesDisplay + secsDisplay).replace(/,\s*$/, '');
    };

    const uptimeText = formatUptime(process.uptime());
    const replyText = `◈━━━━━━━━━━━━━━━━◈\n│❒ *${botname} Uptime*\n\nEstou online há *${uptimeText}*, mantendo tudo em ordem.\n\nEnergia de *${botname}*`;

    await client.sendMessage(m.chat, { text: replyText }, { quoted: m });
  } catch (error) {
    console.error('Error in uptime command:', error);
    await client.sendMessage(m.chat, { text: `◈━━━━━━━━━━━━━━━━◈\n│❒ Não consegui verificar o uptime agora.\n│❒ Tente novamente em instantes.\n◈━━━━━━━━━━━━━━━━◈` }, { quoted: m });
  }
};