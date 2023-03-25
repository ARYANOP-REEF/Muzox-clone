const { EmbedBuilder } = require("discord.js")
module.exports = {
  name: "play",

  aliases: ["p"],
  description: "Plays a song with the given name or url.",
  usage: "<url | Song Name>",
  inVc: true,
  sameVc: true,
  args: true,
  run: async (client, message, args) => {


    const player = await client.poru.createConnection({
      guildId: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeaf: true,
      selfMute: false,
    })

    // Getting tracks
    const resolve = await client.poru.resolve(args.join(' '));
    const { loadType, tracks, playlistInfo } = resolve;

    // Adding in queue
    if (loadType === "PLAYLIST_LOADED") {

      for (let x of resolve.tracks) {
        x.info.requester = message.author;
        player.queue.add(x);

      }
        message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setAuthor({ name: `Queued | ${resolve.tracks.length} from ${playlistInfo.name}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
              .setColor(client.config.embedColor)
            //.setDescription(`<a:emoji_46:938388856095514654> **${resolve.tracks.length}** Tracks From **${resolve.playlistInfo.name}**\n\n**Requester: **<@${message.author.id}>`),

          ]
        });
      
      if (!player.isPlaying && !player.isPaused) return player.play();


    } else if (loadType === "SEARCH_RESULT" || loadType === "TRACK_LOADED") {

      const track = tracks.shift();
      track.info.requester = message.author.tag;

      player.queue.add(track);

      if (!player.isPlaying && !player.isPaused) return player.play();
      if (player.queue.length > 0) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setAuthor({ name: `Queued | ${track.info.title}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
              .setColor(client.config.embedColor)
            //.setDescription(``)   
          ]
        });
      }
    } else {
      const not = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setDescription(`**There were no results found try to be more specific as possible once check song title.**`)


      return message.channel.send({ embeds: [not] })
    }
  }
}
