module.exports = async (context) => {
  const { m, text } = context;

  try {
    if (!text) {
      return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Informe o nome da cidade ou do bairro para consultar o clima.\n◈━━━━━━━━━━━━━━━━◈`);
    }

    const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${text}&units=metric&appid=1ad47ec6172f19dfaf89eb3307f74785`);
    const data = await response.json();

    console.log(`✅ Fetched weather data for ${text}`);

    if (data.cod !== 200) {
      return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Não encontrei ${text}.\n│❒ Tente um nome de local válido.\n◈━━━━━━━━━━━━━━━━◈`);
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

    await m.reply(`◈━━━━━━━━━━━━━━━━◈
│❒ Clima em *${cityName}* 🌎
├──────────────┤
│❒ 🌡️ Temperatura: ${temperature}°C
├──────────────┤
│❒ 🥵 Sensação: ${feelsLike}°C
├──────────────┤
│❒ 📝 Condições: ${description}
├──────────────┤
│❒ 💧 Umidade: ${humidity}%
├──────────────┤
│❒ 🌀 Vento: ${windSpeed} m/s
├──────────────┤
│❒ 🌧️ Chuva (1h): ${rainVolume} mm
├──────────────┤
│❒ ☁️ Nuvens: ${cloudiness}%
├──────────────┤
│❒ 🌄 Nascer do sol: ${sunrise.toLocaleTimeString('pt-BR')}
├──────────────┤
│❒ 🌅 Pôr do sol: ${sunset.toLocaleTimeString('pt-BR')}
◈━━━━━━━━━━━━━━━━◈`);
  } catch (e) {
    console.error(`❌ Error fetching weather for ${text}: ${e.message}`);
    await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Algo deu errado ou ${text} não foi reconhecido.\n│❒ Tente novamente com outro nome.\n◈━━━━━━━━━━━━━━━━◈`);
  }
};