const { Arc } = require('@daostack/client');
const gql = require('graphql-tag');
const auth = require('./token.json');
const Discord = require('discord.js');
const Web3 = require('web3');
const axios = require('axios');
const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws/v3/514edc3fbbde4b22b233ce72e8bc267f'));
const client = new Discord.Client();
client.login(auth.token);

client.on('ready', async function (evt) {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', async function (message) {
  const arc = prepare();
  await arc.fetchContractInfos();

  if (message.content.substring(0, 1) == '!') {
    let messageContent = message.content.split(' ');
    let msgCnt1 = 0;
    if (typeof messageContent[1] !== 'undefined') {
      msgCnt1 = messageContent[1];
    }
    switch (messageContent[0]) {
      case '!ping':
        ping(message);
        break;
      case '!dao':
        let daoData = await querydOrgDao(msgCnt1, arc);
        let daoEmbed = buildDaoEmbed(daoData);
        message.channel.send({ embed: daoEmbed });
        break;
      case '!rep':
        let repData = await queryRepByAddress(msgCnt1, arc, message);
        if (repData) {
          let repEmbed = buildRepEmbed(repData);
          message.channel.send({ embed: repEmbed });
        }
        break;
      default:
        let errorEmbed = errorEmbed("Hmm I don't recognize that command.");
        await message.channel.send({ embed: errorEmbed });
        break;
    }
  }
});

async function ping(message) {
  try {
    let promise = await message.channel.send('Pinging ...');
    promise.edit('Pong.');
  } catch (error) {
    console.error(error);
  }
}

function prepare(message) {
  return new Arc({
    graphqlHttpProvider: 'https://api.thegraph.com/subgraphs/name/daostack/v41_9_xdai',
    graphqlWsProvider: 'wss://ws.api.thegraph.com/subgraphs/name/daostack/v41_9_xdai',
    web3Provider: `wss://mainnet.infura.io/ws/v3/514edc3fbbde4b22b233ce72e8bc267f`,
    ipfsProvider: {
      host: 'subgraph.daostack.io',
      port: '443',
      protocol: 'https',
      'api-path': '/ipfs/api/v0/',
    },
  });
}

async function queryRepByAddress(msgCnt1, arc, message) {
  if (msgCnt1 == 0) {
    let embed = errorEmbed('Must pass an address to check rep for. \r Example: `!rep [YOURE ADDRESS]`');
    await message.channel.send({ embed: embed });
    return false;
  }

  let q = gql`
    {
        reputationHolders(where: {address: "${msgCnt1}", dao: "0x94a587478c83491b13291265581cb983e7feb540"}) {
            id
            address
            contract
            dao {
                id
                __typename
            }
            balance
            createdAt
            __typename
        }

        dao(id: "0x94a587478c83491b13291265581cb983e7feb540") {
            nativeReputation {
                id
                totalSupply
                __typename
            }
            __typename
        }
    }
    `;

  try {
    let result = await arc.sendQuery(q);
    let threebox = await axios('https://ipfs.3box.io/profile?address=' + result.data.reputationHolders[0].address);
    return { daoData: result.data.dao, repData: result.data.reputationHolders[0], threebox: threebox.data };
  } catch (error) {
    console.error(error);
  }
}

async function querydOrgDao(msgCnt1, arc) {
  let daoAddr = '0x94a587478c83491b13291265581cb983e7feb540';
  if (msgCnt1 != 0) {
    daoAddr = msgCnt1;
  }

  let q = gql`
    {
        dao(id: "${daoAddr}") {
            id
            name
            nativeReputation {
                id
                totalSupply
                __typename
            }
            nativeToken {
                id
                name
                symbol
                totalSupply
                __typename
            }
            numberOfQueuedProposals
            numberOfPreBoostedProposals
            numberOfBoostedProposals
            register
            reputationHoldersCount
            __typename
        }
    }
    `;

  let result = await arc.sendQuery(q);
  try {
    return result.data.dao;
  } catch (error) {
    console.error(error);
  }
}

function buildRepEmbed(data) {
  let repData = data.repData;
  let daoData = data.daoData;
  let threebox = data.threebox;
  let dateObject = new Date(repData.createdAt * 1000);
  let imageData = typeof threebox.image !== 'undefined' ? 'https://ipfs.infura.io/ipfs/' + threebox.image[0].contentUrl['/'] : 'https://ipfs.infura.io/ipfs/dd';

  return {
    color: 0x0099ff,
    title: 'Reputation',
    url: 'https://v1.alchemy.do/profile/' + repData.address + '?daoAvatarAddress=' + repData.dao.id,
    thumbnail: {
      url: imageData,
    },
    fields: [
      {
        name: 'ID:',
        value: repData.id,
        inline: false,
      },
      {
        name: 'Address:',
        value: repData.address,
        inline: false,
      },
      {
        name: 'Name:',
        value: threebox.name,
        inline: true,
      },
      {
        name: 'Rep Score:',
        value: ((repData.balance / daoData.nativeReputation.totalSupply) * 100).toFixed(1) + '%',
        inline: true,
      },
      {
        name: 'Rep:',
        value: numberFormat(web3.utils.fromWei(repData.balance)),
        inline: true,
      },
      {
        name: 'Created At:',
        value: new Date(repData.createdAt * 1000).toLocaleString(),
        inline: true,
      },
    ],
    timestamp: new Date(),
  };
}

function buildDaoEmbed(data) {
  return {
    color: 0x0099ff,
    title: data.name + ' Dao',
    url: 'https://v1.alchemy.do/dao/' + data.id,
    thumbnail: {
      url: 'https://gblobscdn.gitbook.com/spaces%2F-LoFU_36XFy2Gb-YCojF%2Favatar-1585889884358.png?alt=media',
    },
    fields: [
      {
        name: 'ID:',
        value: data.id,
        inline: false,
      },
      {
        name: '# Queued Proposals:',
        value: data.numberOfQueuedProposals,
        inline: true,
      },
      {
        name: '# Pre Boosted Proposals:',
        value: data.numberOfPreBoostedProposals,
        inline: true,
      },
      {
        name: '# Boosted Proposals:',
        value: data.numberOfBoostedProposals,
        inline: true,
      },
      {
        name: '# Reputation Holders:',
        value: data.reputationHoldersCount,
        inline: true,
      },
      {
        name: 'Total Rep:',
        value: numberFormat(web3.utils.fromWei(data.nativeReputation.totalSupply)),
        inline: true,
      },
      {
        name: 'Token Name:',
        value: data.nativeToken.name,
        inline: true,
      },
      {
        name: 'Token Symbol:',
        value: data.nativeToken.symbol,
        inline: true,
      },
      {
        name: 'Token Total Supply:',
        value: parseFloat(web3.utils.fromWei(data.nativeToken.totalSupply)).toFixed(2),
        inline: true,
      },
    ],
    timestamp: new Date(),
  };
}

function errorEmbed(message) {
  return {
    color: 0xff0000,
    title: 'Error',
    fields: [
      {
        name: 'Message:',
        value: message,
        inline: true,
      },
    ],
    timestamp: new Date(),
  };
}

function numberFormat(number) {
  return new Intl.NumberFormat().format(number);
}
