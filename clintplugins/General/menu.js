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

    // Envia o texto com botões normais
    await client.sendMessage(
      m.chat,
      {
        text: menuText,
        buttons: [
          { buttonId: `${prefix}menugeral`, buttonText: { displayText: '📜 GERAL' }, type: 1 },
          { buttonId: `${prefix}menugroups`, buttonText: { displayText: '👥 GRUPOS' }, type: 1 },
          { buttonId: `${prefix}menuowner`, buttonText: { displayText: '👑 DONO' }, type: 1 },
          { buttonId: `${prefix}menuai`, buttonText: { displayText: '🧠 IA' }, type: 1 },
          { buttonId: `${prefix}menumedia`, buttonText: { displayText: '🎬 MÍDIA' }, type: 1 },
          { buttonId: `${prefix}menusettings`, buttonText: { displayText: '🛠️ CONFIG' }, type: 1 },
          { buttonId: `${prefix}menuheroku`, buttonText: { displayText: '☁️ HEROKU' }, type: 1 },
          { buttonId: `${prefix}menuprivacy`, buttonText: { displayText: '🔒 PRIVACY' }, type: 1 },
          { buttonId: `${prefix}menueditting`, buttonText: { displayText: '✂️ EDIÇÃO' }, type: 1 },
          { buttonId: `${prefix}menulogo`, buttonText: { displayText: '🎨 LOGO' }, type: 1 },
          { buttonId: `${prefix}menuplus18`, buttonText: { displayText: '🔞 +18' }, type: 1 },
          { buttonId: `${prefix}menuutils`, buttonText: { displayText: '🔧 UTILS' }, type: 1 },
          { buttonId: `${prefix}fullmenu`, buttonText: { displayText: '📋 FULL MENU' }, type: 1 }
        ]
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