b64pad = "="

b64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

bi_rm = "0123456789abcdefghijklmnopqrstuvwxyz"

int2char = (a)->
  bi_rm.charAt a

bAtos = (b) ->
  d = ""
  for c in b
    d += String.fromCharCode c
  d

b64tohex = (f)->
  d = ""
  b = 0
  for e in f
    if e == b64pad
      break
    a = b64map.indexOf e
    if a < 0
      continue
    switch b
      when 0
        d += int2char a >> 2
        c = a & 3
        b = 1
      when 1
        d += int2char (c << 2) | (a >> 4)
        c = a & 15
        b = 2
      when 2
        d += int2char c
        d += int2char a >> 2
        c = a & 3
        b = 3
      else
        d += int2char (c << 2) | (a >> 4)
        d += int2char a & 15
        b = 0

  if b == 1
    d += int2char c << 2
  d

b64toBA = (e) ->
  d = b64tohex e
  b = new Array
  c = 0
  while 2 * c < d.length
    b[c] = parseInt d.substring(2 * c, 2 * c + 2), 16
    ++c
  b

b64utob64 = (a) ->
  if a.length % 4 == 2
    a += "=="
  else
    if a.length % 4 == 3
      a += "="
  a.replace(/-/g, "+").replace /_/g, "/"

b64utos = (a)->
  bAtos b64toBA b64utob64 a

decrypt = (s)->
  JSON.parse b64utos s

crypt =
  decrypt: decrypt

`export default crypt`
