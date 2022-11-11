import { Client, MessageEmbed } from 'discord.js';
import config from "./config.json" assert { type: "json" };
import chalk from 'chalk';
import { LolApi, Constants } from 'twisted';

const api = new LolApi('RGAPI-4507c52a-dba1-49dd-9c0b-d73ff8490d4b');
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"] });

client.on("messageCreate", (message) => {
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.trim().split(/ +/g);
    const cmd = args[0].slice(config.prefix.length).toLowerCase();
    const args1 = message.content.substring(message.content.indexOf(' ')).replace(' ', '');

    if (cmd === "lolstatus") {
        summonerByName(args1).then(summoner => {
            leagueBySummoner(summoner.response.id).then(league => {
                console.log(league.response)
                console.log(summoner.response)

                let embeds = [];
                let files = [];

                embeds.push(new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('🔰🔥 League of Legends Status 🔥🔰')
                    .setDescription(`Abaixo estão as informações do(a) jogador(a) **${summoner.response.name}**`)
                    .setThumbnail(`http://ddragon.leagueoflegends.com/cdn/12.5.1/img/profileicon/${summoner.response.profileIconId.toString()}.png`)
                    .addFields(
                        { name: 'Nível do jogador', value: summoner.response.summonerLevel.toString() }
                    )
                );

                for (const val of league.response) {
                    if (!val.queueType.includes('TFT')) {
                        embeds.push(new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(`🔱 ${val.queueType.replaceAll('_', ' ')} 🔱`)
                            .setThumbnail(`attachment://${val.tier.toLowerCase()}.png`)
                            .addFields(
                                { name: '🟡 ELO 🟡', value: `${val.tier} ${val.rank}`, inline: false },
                                { name: '🟢 VITÓRIAS 🟢', value: val.wins.toString(), inline: false },
                                { name: '🔴 DERROTAS 🔴', value: val.losses.toString(), inline: false },
                                { name: '🔵 PDL 🔵', value: val.leaguePoints.toString(), inline: false },
                            )
                        )
                        files.push(`./tier-icons/${val.tier.toLowerCase()}.png`);
                    }
                }

                embeds.push(new MessageEmbed()
                    .setColor('#0099ff')
                    .setFooter({ text: 'Criado por: Gabriel Fabricio', iconURL: 'https://scontent.fcgh37-1.fna.fbcdn.net/v/t1.6435-9/76680619_1153975204811504_632118572067323904_n.jpg?_nc_cat=109&ccb=1-5&_nc_sid=09cbfe&_nc_eui2=AeHHboSJ5Vu24WCZGCOXra2A74-aCMiVmiTvj5oIyJWaJHxVuQP1yT7ylskNiwldmtxzRwwx7eAkwPDYh84P2tmW&_nc_ohc=of3GEDXvFpIAX9GzP3l&_nc_ht=scontent.fcgh37-1.fna&oh=00_AT-i49-yBqswLdWmFvqMslGSCte-D6XdpQkUqfRrrlSmMQ&oe=6268D9DE' })
                );

                message.channel.send(
                    {
                        embeds: embeds,
                        files: files
                    });
            })
        })
    }
})

client.once("ready", () => {
    console.log(chalk.blue("Bot iniciado como: ") + chalk.green(client.user.tag))
    console.log(chalk.blue("Hora de inicio: ") + chalk.green(new Date().toLocaleString("pt-br")))
})

client.login(config.token)

process.on("unhandledRejection", error => {
    console.log("Erro:", error)
})

export async function summonerByName(name) {
    return await api.Summoner.getByName(name, Constants.Regions.BRAZIL)
}

export async function leagueBySummoner(id) {
    return await api.League.bySummoner(id, Constants.Regions.BRAZIL)
}