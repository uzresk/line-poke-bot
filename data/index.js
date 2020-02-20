const fs = require('fs');
const CosmosClient = require('@azure/cosmos').CosmosClient;
const CosmosDBDao = require('./CosmosDBDao');

const load2Cosmosdb = async () => {
    const pokemon = JSON.parse(fs.readFileSync('./json/pokemon.json', 'utf8'));
    // console.log(pokemon);

    const cosmosClient = new CosmosClient({
        endpoint: process.env.COSMOSDB_ENDPOINT,
        key: process.env.COSMOSDB_KEY,
    });

    const dao = new CosmosDBDao(cosmosClient, "pokemon", "data");
    await dao.init();

    // CosmosDBのRate limitに引っかかるので1秒おきに登録する
    loop(pokemon, (p) => {
        p.id = p.no.toString();
        dao.add(p);
    }, 1000);
};

function loop(array, callback, interval){
    array.forEach(function(d, i){
        setTimeout(function(){
            callback(d);
        }, i * interval);
    });
}

load2Cosmosdb();
