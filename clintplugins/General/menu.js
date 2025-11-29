const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'menu',
  aliases: ['help', 'commands', 'list'],
  description: 'Exibe o menu de comandos do 9bot',
  run: async (context) => {
    const { client, m, mode, botname, text, prefix } = context;

    // Resposta quando o usuário digita algo além do comando
    if (text) {
      await client.sendMessage(
        m.chat,
        {
          text: `Yo ${m.pushName}, pra que complicar?\nÉ só usar *${prefix}menu* e tá tudo certo. 😉`
        },
        { quoted: m, ad: true }
      );
      return;
    }

    const settings = await getSettings();
    const effectivePrefix = settings.prefix || '.';

    // Menu simples em texto
    const menuText = 
`╔═══════════════
║ *${botname} - MENU*
║ Olá, @${m.pushName}
║ Prefixo: ${effectivePrefix}
║ Modo: ${mode}
╠═══════════════
║ 📋 *COMANDOS:*
║ • ${prefix}fullmenu - Todos os comandos
║ • ${prefix}dev - Contato do dev
║ • ${prefix}ping - Status do bot
║ • ${prefix}settings - Configurações
║ 
║ 🌐 *SITE:* 9bot.com.br
╚═══════════════`;

    // Envia apenas o texto
    await client.sendMessage(
      m.chat,
      {
        text: menuText
      },
      { quoted: m }
    );

    // Áudio opcional
    const audioLinks = [
      'https://qu.ax/crnMP',
      'https://qu.ax/caeeD',
      'https://qu.ax/CXWfS',
      'https://qu.ax/ytTHs',
      'https://qu.ax/JGkPc',
      'https://qu.ax/aESvq',
    ];

    const randomAudio = audioLinks[Math.floor(Math.random() * audioLinks.length)];

    await client.sendMessage(
      m.chat,
      {
        audio: { url: randomAudio },
        ptt: true,
        mimetype: 'audio/mpeg',
        fileName: 'toxic-menu.mp3',
      },
      { quoted: m }
    );
  },
};