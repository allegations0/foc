/* from Wikipedia 
https://en.wikipedia.org/wiki/List_of_angels_in_theology
and
https://github.com/alxgiraud/fantasygen/blob/master/public/data/defaultDictionaries.json (ISC License):

Copyright (C) 2016 Alexandre Giraud

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

setup.NAME_angel_female_first_name = function () {
  const firstpart = [
    "adr", "ahr", "ambr",
    "am", "han", "arar",
    "avel", "aver",
    "azaz", "arch", "aur", "ar", "azr", "arch",
    "barach", "eloh", "cass", "celest", "cher", "criss", "triss",
    "camm", "kem", "kam", "kham", "dan", "dard",
    "ere", "gabr", "jibr", "gadr", "handran",
    "han", "har", "zadk",
    "jeh", "jerahm",
    "joph",
    "kerub",
    "kir",
    "kush",
    "kris", "krist",
    "lel",
    "luc", "mar", "matr", "mich",
    "mik", "mur", "nan", "nith", "nur", "pahal",
    "penem", "phan", "poy", "pur", "rag", "randgr", "azr",
    "raz", "rem", "sach",
    "sar", "selaph", "seraph", "sim", "shams", "ten",
    "ur", "uz", "uzz", "veh",
    "arak", "arar", "armar", "art", "asb",
    "bel", "cam", 'carm',
    "cher", "dadr", "elel", "gardr",
    "hadran",
    "nathan", "ophan", "oph", "prav",
    "pur", "ram", "raph", "rikb",
    "sabr", "sarath", "sever", "shamn",
    "sidr", "tam", "tur", "veh",
    "zin", "lys",
  ]

  const secondpart = [
    "isha", "iela", "aala", "ela", "aela",
    'eila', 'eala', 'iala', 'eola', 'iola',
    "aeli", "inne", "uela", "issa", "ina",
    "angel", "ia", "ica", "elette", "eilette", "angela", "ique",
    "elia", "ilia", "ienne", "alette",
  ]

  var firstrand = setup.rng.choice(firstpart)
  var secondrand = setup.rng.choice(secondpart)
  return setup.capitalize(`${firstrand}${secondrand}`)
}
