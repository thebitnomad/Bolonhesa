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
          text:
            `◈━━━━━━━━━━━━━━━━◈
│❒ Yo ${m.pushName}, pra que complicar?
│❒ É só usar *${prefix}menu* e tá tudo certo. 😉
◈━━━━━━━━━━━━━━━━◈`,
        },
        { quoted: m, ad: true }
      );
      return;
    }

    const settings = await getSettings();
    const effectivePrefix = settings.prefix || '.';

    // Texto do menu principal com o mesmo estilo
    const menuText =
      `
    *( 💬 ) - Olá, @${m.pushName}*
   Bem-vindo ao menu do bot.
   Aqui você vê o que o *9Bot*🤖✅      sabe fazer. 
   
   NOSSA PÁGINA PRINCIPAL/SITE 🌟
       [https://9bot.com.br]
◈━━━━━━━━━━━━━━━━◈

- 計さ INFORMAÇÕES DO BOT ✓

⌬ *Bot*:
9bot

⌬ *Prefixo*:
${effectivePrefix}

⌬ *Modo*:
${mode} ( ! )

◈━━━━━━━━━━━━━━━━◈

( ! ) *Selecione uma categoria abaixo para ver os comandos.*`;

    // Envia o texto com botões normais (mantendo o mesmo estilo visual)
    await client.sendMessage(
      m.chat,
      {
        text: menuText,
        buttons: [
          { buttonId: `${prefix}menugeral`, buttonText: { displayText: '│❒GERALMENU' }, type: 1 },
          { buttonId: `${prefix}menugroups`, buttonText: { displayText: '│❒GRUPOSMENU' }, type: 1 },
          { buttonId: `${prefix}menuowner`, buttonText: { displayText: '│❒DONOMENU' }, type: 1 },
          { buttonId: `${prefix}menuai`, buttonText: { displayText: '│❒IAMENH' }, type: 1 },
          { buttonId: `${prefix}menumedia`, buttonText: { displayText: '│❒MÍDIAMENU' }, type: 1 },
          { buttonId: `${prefix}menusettings`, buttonText: { displayText: '│❒CONFIGMENU' }, type: 1 },
          { buttonId: `${prefix}menuheroku`, buttonText: { displayText: '│❒HEROKUMENU' }, type: 1 },
          { buttonId: `${prefix}menuprivacy`, buttonText: { displayText: '│❒PRIVACYMENU' }, type: 1 },
          { buttonId: `${prefix}menueditting`, buttonText: { displayText: '│❒EDIÇÃOMENU' }, type: 1 },
          { buttonId: `${prefix}menulogo`, buttonText: { displayText: '│❒LOGOMENU' }, type: 1 },
          { buttonId: `${prefix}menuplus18`, buttonText: { displayText: '│❒+18MENU' }, type: 1 },
          { buttonId: `${prefix}menuutils`, buttonText: { displayText: '│❒UTILSMENU' }, type: 1 },
          { buttonId: `${prefix}support`, buttonText: { displayText: 'ABRIR PÁGINA DE SUPORTE/AJUDA' }, type: 1 }
        ]
      },
      { quoted: m }
    );

    // Áudio opcional (mantido igual)
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