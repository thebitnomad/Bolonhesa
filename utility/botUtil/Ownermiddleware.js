const Ownermiddleware = async (context, next) => {
    const { m, Owner } = context;

    if (!Owner) {
        return m.reply(`◈━━━━━━━━━━━━━━━━◈
│❒ Este comando é exclusivo para o *Owner* do bot.  
│❒ Parece que você não possui permissão para utilizá-lo no momento.  
│❒ Caso precise de algo, posso ajudar com outros comandos disponíveis. 😊
◈━━━━━━━━━━━━━━━━◈
> Powered by *9bot*`);
    }

    await next();
};

module.exports = Ownermiddleware;
