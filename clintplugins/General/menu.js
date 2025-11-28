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

    // Conversor de fonte estilizada (mantido para uso futuro/expansões)
    const toFancyFont = (text, isUpperCase = false) => {
      const fonts = {
        A: '𝘼', B: '𝘽', C: '𝘾', D: '𝘿', E: '𝙀', F: '𝙁', G: '𝙂', H: '𝙃', I: '𝙄', J: '𝙅', K: '𝙆', L: '𝙇', M: '𝙈',
        N: '𝙉', O: '𝙊', P: '𝙋', Q: '𝙌', R: '𝙍', S: '𝙎', T: '𝙏', U: '𝙐', V: '𝙑', W: '𝙒', X: '𝙓', Y: '𝙔', Z: '𝙕',
        a: '𝙖', b: '𝙗', c: '𝙘', d: '𝙙', e: '𝙚', f: '𝙛', g: '𝙜', h: '𝙝', i: '𝙞', j: '𝙟', k: '𝙠', l: '𝙡', m: '𝙢',
        n: '𝙣', o: '𝙤', p: '𝙥', q: '𝙦', r: '𝙧', s: '𝙨', t: '𝙩', u: '𝙪', v: '𝙫', w: '𝙬', x: '𝙭', y: '𝙮', z: '𝙯',
      };
      return (isUpperCase ? text.toUpperCase() : text.toLowerCase())
        .split('')
        .map((char) => fonts[char] || char)
        .join('');
    };

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

    // Mensagem interativa com botões
    const msg = generateWAMessageFromContent(
      m.chat,
      {
        interactiveMessage: {
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
              directPath:
                '/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc?ccb=11-4&oh=01_Q5Aa2QGGiJj--6eHxoTTTTzuWtBgCrkcXBz9hN_y2s_Z1lrABA&oe=68D7901C&_nc_sid=5e03e0',
              mediaKeyTimestamp: '1756370084',
              jpegThumbnail: pict,
            },
            hasMediaAttachment: true,
          },
          body: { text: menuText },
          footer: { text: `Powered by ${botname}` },
          nativeFlowMessage: {
            buttons: [
              {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                  display_text: 'Adquira o bot em',
                  url: 'https://9bot.com.br',
                  merchant_url: 'https://9bot.com.br',
                }),
              },
              {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  title: '𝐕𝐈𝐒𝐔𝐀𝐋𝐈𝐙𝐀𝐑 ☇ 𝐎𝐏ÇÕ𝐄𝐒 ☑',
                  sections: [
                    {
                      title: '⌜ 𝘾𝙤𝙢𝙖𝙣𝙙𝙤𝙨 𝘾𝙚𝙣𝙩𝙧𝙖𝙞𝙨 ⌟',
                      highlight_label: '© 丨几匚',
                      rows: [
                        {
                          title: '𝐅𝐮𝐥𝐥𝐌𝐞𝐧𝐮',
                          description: 'Mostrar todos os comandos disponíveis',
                          id: `${prefix}fullmenu`,
                        },
                        {
                          title: '𝐃𝐞𝐯',
                          description: 'Enviar contato do desenvolvedor',
                          id: `${prefix}dev`,
                        },
                      ],
                    },
                    {
                      title: 'ℹ 𝙄𝙣𝙛𝙤 𝙙𝙤 𝘽𝙤𝙩',
                      highlight_label: '© 丨几匚',
                      rows: [
                        { title: '𝐏𝐢𝐧𝐠', description: 'Ver status/latência do bot', id: `${prefix}ping` },
                        {
                          title: '𝐒𝐞𝐭𝐭𝐢𝐧𝐠𝐬',
                          description: 'Mostrar configurações atuais do bot',
                          id: `${prefix}settings`,
                        },
                      ],
                    },
                  ],
                }),
              },
            ],
            messageParamsJson: JSON.stringify({
              limited_time_offer: {
                text: '9BOT',
                url: 'https://9bot.com.br',
                copy_code: '9BOT',
                expiration_time: Date.now() * 1000,
              },
              bottom_sheet: {
                in_thread_buttons_limit: 2,
                divider_indices: [1, 2],
                list_title: 'Selecione um comando',
                button_title: '9BOT',
              },
            }),
          },
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
