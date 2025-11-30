const fs = require('fs');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'menuai',
  aliases: ['ia'],
  description: 'Comandos de IA',
  run: async (context) => {
    const { client, m, prefix } = context;
    
    const commands = fs.readdirSync('./clintplugins/AI').filter(file => file.endsWith('.js'));
    
    let menuText = `*🧠 COMANDOS DE INTELIGÊNCIA ARTIFICIAL*\n\n`;
    commands.forEach(file => {
      const cmd = file.replace('.js', '');
      menuText += `• ${prefix}${cmd}\n`;
    });
    
    await client.sendMessage(m.chat, { text: menuText }, { quoted: m });
  }
};