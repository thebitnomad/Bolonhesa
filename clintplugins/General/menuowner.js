const fs = require('fs');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'menuowner',
  aliases: ['dono'],
  description: 'Comandos do dono',
  run: async (context) => {
    const { client, m, prefix } = context;
    
    const commands = fs.readdirSync('./clintplugins/Owner').filter(file => file.endsWith('.js'));
    
    let menuText = `*👑 COMANDOS DO DONO*\n\n`;
    commands.forEach(file => {
      const cmd = file.replace('.js', '');
      menuText += `• ${prefix}${cmd}\n`;
    });
    
    await client.sendMessage(m.chat, { text: menuText }, { quoted: m });
  }
};