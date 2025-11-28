const fs = require('fs');

module.exports = async (context) => {
  const { m, text } = context;

  const formatStylishReply = (message) => {
    return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
  };

  try {
    if (!text) {
      return m.reply(
        formatStylishReply(
          `Por favor, envie o nome de uma cidade ou região para consultar o clima.\n` +
          `Exemplo: !tempo São Paulo`
        )
      );
    }

    const encodedCity = encodeURIComponent(text.trim());
    const response = await fetch(
      `http://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&units=metric&lang=pt_br&appid=1ad47ec6172f19dfaf89eb3307f74785`
    );
    const data = await response.json();

    console.log(
      formatStylishReply(
        `Dados de clima obtidos para: ${text}`
      )
    );

    if (data.cod !== 200) {
      return m.reply(
        formatStylishReply(
          `Não consegui encontrar informações de clima para *${text}*.\n` +
          `Verifique se o nome da cidade está correto e tente novamente.`
        )
      );
    }

    const cityName = data.name;
    const temperature = data.main.temp;
    const feelsLike = data.main.feels_like;
    const minTemperature = data.main.temp_min;
    const maxTemperature = data.main.temp_max;
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const rainVolume = data.rain ? data.rain['1h'] : 0;
    const cloudiness = data.clouds.all;
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);

    await m.reply(
      `◈━━━━━━━━━━━━━━━━◈
│❒ Clima em *${cityName}* 🌎
├──────────────┤
│❒ 🌡️ Temperatura: ${temperature}°C (mín.: ${minTemperature}°C / máx.: ${maxTemperature}°C)
├──────────────┤
│❒ 🥵 Sensação térmica: ${feelsLike}°C
├──────────────┤
│❒ 📝 Condições: ${description}
├──────────────┤
│❒ 💧 Umidade: ${humidity}%
├──────────────┤
│❒ 🌀 Vento: ${windSpeed} m/s
├──────────────┤
│❒ 🌧️ Chuva (1h): ${rainVolume} mm
├──────────────┤
│❒ ☁️ Nebulosidade: ${cloudiness}%
├──────────────┤
│❒ 🌄 Nascer do sol: ${sunrise.toLocaleTimeString('pt-BR')}
├──────────────┤
│❒ 🌅 Pôr do sol: ${sunset.toLocaleTimeString('pt-BR')}
◈━━━━━━━━━━━━━━━━◈`
    );
  } catch (e) {
    console.error(
      formatStylishReply(
        `Erro ao buscar dados de clima para ${text || 'cidade não informada'}: ${e.message}`
      )
    );

    await m.reply(
      formatStylishReply(
        `Não foi possível obter os dados de clima no momento.\n` +
        `Tente novamente em alguns instantes.`
      )
    );
  }
};
