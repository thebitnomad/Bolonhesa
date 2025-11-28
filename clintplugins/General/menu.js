const fs = require('fs');
const path = require('path');
const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');
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

    // Mensagem interativa com nativeFlowMessage DENTRO de interactiveMessage
    const msg = generateWAMessageFromContent(
      m.chat,
      {
        interactiveMessage: {
          nativeFlowMessage: {
            buttons: [
              {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                  display_text: '🌐 Adquira o bot em',
                  url: 'https://9bot.com.br',
                }),
              },
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: '📋 Full Menu',
                  id: `${prefix}fullmenu`
                })
              },
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: '👨‍💻 Dev',
                  id: `${prefix}dev`
                })
              },
              {
                name: 'quick_reply', 
                buttonParamsJson: JSON.stringify({
                  display_text: '📊 Status',
                  id: `${prefix}ping`
                })
              },
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: '⚙ Settings', 
                  id: `${prefix}settings`
                })
              }
            ],
            messageParamsJson: JSON.stringify({
              title: `${botname} - Menu`,
              body: menuText,
              footer: `Powered by ${botname}`,
            })
          },
          header: {
            documentMessage: {
              url: 'https://mmg.whatsapp.net/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc?ccb=11-4&oh=01_Q5Aa2QGGiJj--6eHxoTTTTzuWtBgCrkcXBz9hN_y2s_Z1lrABA&oe=68D7901C&_nc_sid=5e03e0&mms3=true',
              mimetype: 'image/png',
              fileSha256: '+gmvvCB6ckJSuuG3ZOzHsTBgRAukejv1nnfwGSSSS/4=',
              fileLength: '1435',
              pageCount: 0,
              mediaKey: 'MWO6fI223TY8T0i9onNcwNBBPldWfwp1j1FPKCiJFzw=',
              fileName: 'Toxic-MD',
              fileEncSha256: 'ZS8v9tio2un1yWVOOG3lwBxiP+mNgaKPY9+wl5pEoi8=',
              directPath: '/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc?ccb=11-4&oh=01_Q5Aa2QGGiJj--6eHxoTTTTzuWtBgCrkcXBz9hN_y2s_Z1lrABA&oe=68D7901C&_nc_sid=5e03e0',
              mediaKeyTimestamp: '1756370084',
              jpegThumbnail: pict,
            },
            hasMediaAttachment: true,
          },
          body: { text: menuText },
          footer: { text: `Powered by ${botname}` },
          contextInfo: {
            externalAdReply: {
              title: `${botname}`,
              body: `Yo, ${m.pushName}! Bora ver o que o bot sabe fazer? 😈`,
              mediaType: 1,
              thumbnail: pict,
              mediaUrl: '',
              sourceUrl: 'https://9bot.com.br',
              showAdAttribution: false,
              renderLargerThumbnail: true,
            },
          },
        },
      },
      { quoted: m }
    );

    await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

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