const fs = require('fs');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'menueditting',
  aliases: ['edicao'],
  description: 'Comandos de edição',
  run: async (context) => {
    const { client, m, prefix } = context;
    
    const commands = fs.readdirSync('./clintplugins/Editting').filter(file => file.endsWith('.js'));
    
    let menuText = `*✂️ COMANDOS DE EDIÇÃO*\n\n`;
    commands.forEach(file => {
      const cmd = file.replace('.js', '');
      menuText += `• ${prefix}${cmd}\n`;
    });
    
    await client.sendMessage(m.chat, { text: menuText }, { quoted: m });
  }
};