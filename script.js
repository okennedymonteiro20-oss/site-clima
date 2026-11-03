
const campoCidade = document.getElementById("campoCidade");
const botaoBuscar = document.getElementById("botaoBuscar");

const nomeCidade = document.getElementById("nome_cidade");
const condicao = document.getElementById("condicao");
const temperatura = document.getElementById("temperatura");
const sensacao = document.getElementById("sensacao");
const umidade = document.getElementById("umidade");
const vento = document.getElementById("vento");
const mensagem = document.getElementById("mensagem");

// Traduz os códigos meteorológicos da API
function interpretarClima(codigo) {
    if (codigo === 0) return "Céu limpo ☀️";
    if ([1, 2, 3].includes(codigo)) return "Parcialmente nublado 🌤️";
    if ([45, 48].includes(codigo)) return "Neblina 🌫️";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(codigo)) return "Chuva 🌧️";
    if ([71, 73, 75, 77, 85, 86].includes(codigo)) return "Neve ❄️";
    if ([95, 96, 99].includes(codigo)) return "Tempestade ⛈️";

    return "Condição desconhecida";
}

// Pesquisa o clima
async function buscarClima() {

    const cidade = campoCidade.value.trim();

    if (cidade === "") {
        mensagem.textContent = "Digite uma cidade!";
        return;
    }

    mensagem.textContent = "Buscando...";
    botaoBuscar.disabled = true;

    try {

        // Busca as coordenadas da cidade
        const respostaCidade = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`
        );

        if (!respostaCidade.ok) {
            throw new Error("Erro ao pesquisar a cidade.");
        }

        const dadosCidade = await respostaCidade.json();

        if (!dadosCidade.results || dadosCidade.results.length === 0) {
            throw new Error("Cidade não encontrada.");
        }

        const local = dadosCidade.results[0];

        // Busca o clima usando latitude e longitude
        const respostaClima = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}&longitude=${local.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
        );

        if (!respostaClima.ok) {
            throw new Error("Não foi possível buscar o clima.");
        }

        const dadosClima = await respostaClima.json();

        const atual = dadosClima.current;

        // Atualiza as informações na página
        nomeCidade.textContent = `${local.name}, ${local.country}`;
        condicao.textContent = interpretarClima(atual.weather_code);
        temperatura.textContent = `${atual.temperature_2m} °C`;
        sensacao.textContent = `Sensação térmica: ${atual.apparent_temperature} °C`;
        umidade.textContent = `Umidade: ${atual.relative_humidity_2m}%`;
        vento.textContent = `Vento: ${atual.wind_speed_10m} km/h`;

        mensagem.textContent = "";

    } catch (erro) {

        mensagem.textContent = erro.message;

    } finally {

        botaoBuscar.disabled = false;

    }
}

// Executa a pesquisa ao clicar
botaoBuscar.addEventListener("click", buscarClima);

// Permite pesquisar apertando Enter
campoCidade.addEventListener("keydown", function(evento) {
    if (evento.key === "Enter") {
        buscarClima();
    }
});
