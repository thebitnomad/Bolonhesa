const fs = require('fs');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'menugroups',
  aliases: ['grupos'],
  description: 'Comandos para grupos',
  run: async (context) => {
    const { client, m, prefix } = context;
    
    const commands = fs.readdirSync('./clintplugins/Groups').filter(file => file.endsWith('.js'));
    
    let menuText = `*👥 COMANDOS PARA GRUPOS*\n\n`;
    commands.forEach(file => {
      const cmd = file.replace('.js', '');
      menuText += `• ${prefix}${cmd}\n`;
    });
    
    await client.sendMessage(m.chat, { text: menuText }, { quoted: m });
  }
};