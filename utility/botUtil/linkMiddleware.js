module.exports = async (context, next) => {
    const { m, isBotAdmin } = context;

    if (!m.isGroup) {
        return m.reply(`◈━━━━━━━━━━━━━━━━◈
│❒ Este comando funciona apenas em grupos. 😊
◈━━━━━━━━━━━━━━━━◈`);
    }
    
    if (!isBotAdmin) {
        return m.reply(`◈━━━━━━━━━━━━━━━━◈
│❒ Preciso ser administrador do grupo para conseguir o link.  
│❒ Por favor, me conceda permissão de admin. 🙏
◈━━━━━━━━━━━━━━━━◈`);
    }

    await next(); // Continua para o próximo handler
};
