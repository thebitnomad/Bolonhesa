module.exports = async (context) => {
  const { client, m } = context;

  const message = `◈━━━━━━━━━━━━━━━━◈
│❒ *Links de Suporte – 9bot*
│❒
│❒
│❒ 📢 *Canal oficial:*
│❒ https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19
│❒
│❒ 👥 *Grupo de suporte:*
│❒ https://chat.whatsapp.com/GoXKLVJgTAAC3556FXkfFI
│❒
│❒ Powered by 9bot.com.br
◈━━━━━━━━━━━━━━━━◈`;

  try {
    await client.sendMessage(
      m.chat,
      { text: message },
      { quoted: m }
    );
  } catch (error) {
    console.error('Support command error:', error);
    await m.reply(
      '◈━━━━━━━━━━━━━━━━◈\n' +
      '│❒ Não foi possível enviar os links de suporte agora.\n' +
      '│❒ Tente novamente em alguns instantes.\n' +
      '◈━━━━━━━━━━━━━━━━◈'
    );
  }
};
