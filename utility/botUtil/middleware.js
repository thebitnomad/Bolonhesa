const middleware = async (context, next) => {
    const { m, isBotAdmin, isAdmin } = context;

    if (!m.isGroup) {
        return m.reply(`◈━━━━━━━━━━━━━━━━◈
│❒ Este comando só pode ser usado em grupos.  
│❒ Tente novamente em um grupo. 😊
◈━━━━━━━━━━━━━━━━◈`);
    }

    if (!isAdmin) {
        return m.reply(`◈━━━━━━━━━━━━━━━━◈
│❒ Apenas administradores podem usar este comando.  
│❒ Caso precise, solicite permissão ao administrador. 👍
◈━━━━━━━━━━━━━━━━◈`);
    }

    if (!isBotAdmin) {
        return m.reply(`◈━━━━━━━━━━━━━━━━◈
│❒ Para continuar, preciso ter permissão de administrador no grupo.  
│❒ Por favor, me conceda acesso para que eu possa ajudar melhor. 🙏
◈━━━━━━━━━━━━━━━━◈`);
    }

    await next(); // Proceed to the next function (main handler)
};

module.exports = middleware;
