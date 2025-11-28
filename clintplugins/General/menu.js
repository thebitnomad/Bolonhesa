const fs = require('fs');
const path = require('path');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'menu',
  aliases: ['help', 'commands', 'list'],
  description: 'Exibe o menu de comandos do 9bot com botões interativos',
  run: async (context) => {
    const { client, m, mode, pict, botname, text, prefix } = context;

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
    const effectivePrefix = settings.prefix || '.'; // Prefixo dinâmico do banco

    // Texto do menu principal
    const menuText =
      `◈━━━━━━━━━━━━━━━━◈
│❒ *( 💬 ) - Olá, @${m.pushName}*
│❒ Bem-vindo ao menu do bot.
│❒ Aqui você vê o que o *${botname}* sabe fazer. 
◈━━━━━━━━━━━━━━━━◈

- 計さ INFORMAÇÕES DO BOT ✓

⌬ *Bot*:
9bot

⌬ *Prefixo*:
${effectivePrefix} (decora isso direitinho 😌)

⌬ *Modo*:
${mode} ( ! )

◈━━━━━━━━━━━━━━━━◈

( ! ) *Selecione uma opção abaixo para continuar.*`;

    // Mensagem com lista de botões (compatível com iOS)
    const listMessage = {
      text: menuText,
      footer: `Powered by ${botname}`,
      title: "🎪 Menu Principal",
      buttonText: "📱 Abrir Opções",
      sections: [
        {
          title: "⌜ 𝘾𝙤𝙢𝙖𝙣𝙙𝙤𝙨 𝘾𝙚𝙣𝙩𝙧𝙖𝙞𝙨 ⌟",
          rows: [
            {
              title: "𝐅𝐮𝐥𝐥𝐌𝐞𝐧𝐮",
              description: "Mostrar todos os comandos disponíveis",
              rowId: `${prefix}fullmenu`
            },
            {
              title: "𝐃𝐞𝐯",
              description: "Enviar contato do desenvolvedor",
              rowId: `${prefix}dev`
            }
          ]
        },
        {
          title: "ℹ 𝙄𝙣𝙛𝙤 𝙙𝙤 𝘽𝙤𝙩",
          rows: [
            {
              title: "𝐏𝐢𝐧𝐠",
              description: "Ver status/latência do bot",
              rowId: `${prefix}ping`
            },
            {
              title: "𝐒𝐞𝐭𝐭𝐢𝐧𝐠𝐬",
              description: "Mostrar configurações atuais do bot",
              rowId: `${prefix}settings`
            }
          ]
        },
        {
          title: "🔗 𝙇𝙞𝙣𝙠𝙨 𝙀𝙭𝙩𝙚𝙧𝙣𝙤𝙨",
          rows: [
            {
              title: "🌐 𝐒𝐢𝐭𝐞 𝐎𝐟𝐢𝐜𝐢𝐚𝐥",
              description: "Visitar site oficial do 9bot",
              rowId: `${prefix}site`
            }
          ]
        }
      ]
    };

    await client.sendMessage(m.chat, listMessage);

    // Lógica de áudio aleatório
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