const config = require('../private/config.json').riotApi;
apiKey = config.apiKey;
const axios = require('axios');

/**
 * Função para obter a conta pelo nome de usuário e tag.
 * @param {string} region - A região do servidor da conta.
 * @param {string} gameName - O nome de usuário do jogo.
 * @param {string} tagLine - A tag do usuário do jogo.
 * @returns {Promise<Object>} Um objeto representando a conta do usuário.
 */
async function getAccountByRiotId(region, gameName, tagLine) {
    const url = `https://${region}.${config.baseUrl}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}?api_key=${apiKey}`;
    try{
      const response = await axios.get(url);
      return response.data;
    } catch(err) {
      console.error(err)
      return undefined
    }
  }
  
  
  /**
   * Função para obter a maestria de campeão de um jogador.
   * @param {string} server - O servidor do jogo.
   * @param {string} PUUID - O PUUID do jogador.
   * @returns {Promise<Object>} Um objeto representando a maestria de todos campeões da conta do jogador.
   */
  async function getChampionMastery(server, PUUID) {
    const url = `https://${server}.${config.baseUrl}/lol/champion-mastery/v4/champion-masteries/by-puuid/${encodeURIComponent(PUUID)}?api_key=${apiKey}`;
    try{
      const response = await axios.get(url);
      return response.data;
    } catch(err) {
      console.error(err)
      return undefined
    }
  }

  async function fetchChampionName(key) {
    const url = `http://ddragon.leagueoflegends.com/cdn/${await getDDragonLatestVersion()}/data/en_US/champion.json`;
    try {
        const response = await axios.get(url);
        const championData = response.data.data;
        for (const champion in championData) {
            if (championData[champion].key == key) {
                return {
                    id: championData[champion].id,
                    key: championData[champion].key,
                    sprite: championData[champion].image.sprite,
                    fullImage: championData[champion].image.full,
                    title: championData[champion].title,
                    blurb: championData[champion].blurb,
                    tags: championData[champion].tags,
                    name: championData[champion].name,
                };
            }
        }
        return null; // Retorna null se o campeão não for encontrado
    } catch (err) {
        console.error(err);
        return null; // Retorna null em caso de erro
    }
}

async function getChampionRotation() {
    const url = `https://euw1.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=${apiKey}`;
    try {
        const response = await axios.get(url);
        return response.data.freeChampionIds;
    } catch (err) {
        console.error(err);
        return undefined;
    }
}

async function getMatchHistory(region, PUUID) {
    const url = `https://${region}.${config.baseUrl}/lol/match/v5/matches/by-puuid/${PUUID}/ids?start=0&count=10&api_key=${apiKey}`;
    try {
        const response = await axios.get(url);
        const matchIds = response.data;
        const matchHistory = [];
        for (const matchId of matchIds) {
            const matchUrl = `https://${region}.${config.baseUrl}/lol/match/v5/matches/${matchId}?api_key=${apiKey}`;
            const matchResponse = await axios.get(matchUrl);
            matchHistory.push(matchResponse.data);
        }
        return matchHistory;

    } catch (err) {
        console.error(err);
        return undefined;
    }
}
  
  
  /**
   * Função para obter informações do invocador.
   * @param {string} server - O servidor do jogo.
   * @param {string} PUUID - O PUUID do jogador.
   * @returns {Promise<Object>} Um objeto representando as informações do invocador.
   */
  async function getSummonerInfo(server, PUUID) {
    const url = `https://${server}.${config.baseUrl}/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(PUUID)}?api_key=${apiKey}`;
    try{
      const response = await axios.get(url);
      return response.data;
    } catch(err) {
      console.error(err)
      return undefined
    }
  }
  
  
  /**
   * Função para obter entradas na liga de um invocador.
   * @param {string} server - O servidor do jogo.
   * @param {string} summonerId - O ID do invocador.
   * @returns {Promise<Array<Object>>} Um array de objetos representando as entradas na liga do invocador.
   */
  async function getLeagueEntries(server, summonerId) {
    const url = `https://${server}.${config.baseUrl}/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${apiKey}`;
    try{
      const response = await axios.get(url);
      return response.data;
    } catch(err) {
      console.error(err)
      return undefined
    }
  }

  async function getDDragonVersions() {
    const url = 'https://ddragon.leagueoflegends.com/api/versions.json';
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (err) {
        console.error(err);
        return undefined;
    }
}

async function getDDragonLatestVersion() {
    const versions = await getDDragonVersions();
    return versions[0];
}

module.exports = {
    getAccountByRiotId,
    getChampionMastery,
    getSummonerInfo,
    getLeagueEntries,
    getDDragonVersions,
    getDDragonLatestVersion,
    fetchChampionName,
    getChampionRotation,
    getMatchHistory
};