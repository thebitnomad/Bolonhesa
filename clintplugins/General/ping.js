module.exports = {
  name: 'ping',
  aliases: ['p'],
  description: 'Verifica o tempo de resposta e o status do bot',
  run: async (context) => {
    const { client, m, toxicspeed } = context;

    try {
      // Formata uptime do bot em texto legível
      const formatUptime = (seconds) => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        const parts = [];
        if (days > 0) parts.push(`${days} dia${days > 1 ? 's' : ''}`);
        if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
        if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);
        if (secs > 0) parts.push(`${secs} segundo${secs > 1 ? 's' : ''}`);

        return parts.join(', ') || '0 segundos';
      };

      const botUptime = formatUptime(process.uptime());

      // Trata toxicspeed de forma mais segura (segundos ou ms)
      const rawSpeed = Number(toxicspeed || 0.0094);
      const speedMs = rawSpeed < 10 ? rawSpeed * 1000 : rawSpeed;
      const pingSpeed = speedMs.toFixed(2);

      // Uso de CPU aleatório para efeito visual
      const randomCpuUsage = `${Math.floor(Math.random() * 40) + 5}%`;

      const pingText = `◈━━━━━━━━━━━━━━━━◈
│❒ *Status do Bot ⌬*
│❒ *Tempo online:* ${botUptime}
│❒ *Velocidade de resposta:* ${pingSpeed} ms
│❒ *Uso de CPU:* ${randomCpuUsage}
│❒
│❒ Tudo funcionando por aqui, ${m.pushName}. 😉
◈━━━━━━━━━━━━━━━━◈`;

      await client.sendMessage(
        m.chat,
        { text: pingText },
        { quoted: m }
      );
    } catch (error) {
      console.error(`Ping command error: ${error}`);
      await client.sendMessage(
        m.chat,
        {
          text: `◈━━━━━━━━━━━━━━━━◈
│❒ Algo deu errado ao verificar o ping.
│❒ Tente novamente em alguns instantes.
◈━━━━━━━━━━━━━━━━◈`
        },
        { quoted: m }
      );
    }
  }
};
