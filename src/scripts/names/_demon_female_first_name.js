
/* from
https://github.com/cmho/belfnames/blob/master/nelves.rb
*/

setup.NAME_demon_female_first_name = function() {
  const firstpart = [
    "Aag", "Karg", "Ulthu", "Alur", "Khark", "Urz", "Arak", "Krau", "Uti",
    "Az", "Kriv", "Uznid", "Azik", "Kuaz", "Virn", "Bral", "Kudu", "Vlaaj",
    "Braz", "Luri", "Vlag", "Bruh", "Mulk", "Vlash", "Draan", "Nau", "Vluk",
    "Drulg", "Nid", "Vluzak", "Guz", "Ninj", "Vraz", "Haug", "Nul", "Vulk",
    "Idru", "Nym", "Xau", "Jhaal", "Ranag", "Xid", "Jid", "Rilthu", "Xul",
    "Jiu", "Ruk", "Xuraj", "Jur", "Rulk", "Zauv", "Jurg", "Ruz", "Zug",
    "Jurz", "Saag", "Zuldu", "Kaaz", "Skaur", "Zuv", "Pand", "Mer",
  ]
  const secondpart = [
    "anil", "bau", "diu", "dusla", "giu", "ija", "izil", "jiul", "lihyl",
    "lin", "lyrr", "nalu", "rhyl", "rula", "skiu", "sula", "ulla", "xhiu",
    "zihyl", "ziu", "emonia", "eonia", 
  ]
  var firstrand = setup.rng.choice(firstpart)
  var secondrand = setup.rng.choice(secondpart)
  return `${firstrand}${secondrand}`
}
