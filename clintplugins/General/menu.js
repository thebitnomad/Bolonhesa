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

    // Menu principal com list buttons para categorias
    const menuText = 
`╔═══════════════
║ *${botname} - MENU PRINCIPAL*
║ Olá, @${m.pushName}
║ Prefixo: ${effectivePrefix}
║ Modo: ${mode}
╠═══════════════
║ 📂 *CATEGORIAS:*
║ 
║ Selecione uma categoria abaixo
║ para ver os comandos específicos!
║ 
║ 🌐 *SITE:* 9bot.com.br
╚═══════════════`;

    // Envia o texto com LIST BUTTONS para categorias
    await client.sendMessage(
      m.chat,
      {
        text: menuText,
        title: `📱 ${botname} - MENU PRINCIPAL`,
        buttonText: "📂 ABRIR CATEGORIAS",
        sections: [
          {
            title: "🔧 CATEGORIAS DE COMANDOS",
            rows: [
              { title: "📜 GERAL", rowId: `${prefix}menugeral`, description: "Comandos gerais para todos" },
              { title: "🛠️ CONFIGURAÇÕES", rowId: `${prefix}menusettings`, description: "Configurações do bot" },
              { title: "👑 DONO", rowId: `${prefix}menuowner`, description: "Comandos exclusivos do dono" },
              { title: "☁️ HEROKU", rowId: `${prefix}menuheroku`, description: "Comandos do Heroku" },
              { title: "🔒 PRIVACIDADE", rowId: `${prefix}menuprivacy`, description: "Comandos de privacidade" },
              { title: "👥 GRUPOS", rowId: `${prefix}menugroups`, description: "Comandos para grupos" },
              { title: "🧠 INTELIGÊNCIA ARTIFICIAL", rowId: `${prefix}menuai`, description: "Comandos de IA" },
              { title: "🎬 MÍDIA", rowId: `${prefix}menumedia`, description: "Comandos de mídia" },
              { title: "✂️ EDIÇÃO", rowId: `${prefix}menueditting`, description: "Comandos de edição" },
              { title: "🎨 LOGO", rowId: `${prefix}menulogo`, description: "Comandos de logo" },
              { title: "🔞 +18", rowId: `${prefix}menuplus18`, description: "Comandos +18 (cuidado!)" },
              { title: "🔧 UTILITÁRIOS", rowId: `${prefix}menuutils`, description: "Comandos utilitários" },
              { title: "📋 TODOS OS COMANDOS", rowId: `${prefix}fullmenu`, description: "Lista completa de todos os comandos" }
            ]
          }
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