
import requests
import json
import datetime

domain = 'http://www.pathery.com';

scores_cache = {}

def get_scores(mapid, page):
  index = str(mapid) + '_' + str(page)
  if index in scores_cache:
    return scores_cache[index]
  r = requests.get(domain + '/a/score/' + index + '.js')
  ans = json.loads(r.text)
  scores_cache[index] = ans
  return ans

def get_todays_mapids():
  now = datetime.datetime.now()
  date = now.isoformat();
  r = requests.get(domain + '/a/mapsbydate/' + date + '.js')
  ans = json.loads(r.text)
  return ans

def find_max_score(mapid):
  return get_scores(mapid, 1)[u'users']['1'][u'moves']

def find_user_score(mapid, user_ID):
  page = 1
  while True:
    s = get_scores(mapid, page)
    if u'users' not in s: # reached last page
      return None
    for i in range(10):
      rank = page * 10 + i - 9
      if str(rank) not in s[u'users']:
        return None
      if s[u'users'][str(rank)][u'ID'] == str(user_ID):
        return s[u'users'][str(rank)][u'moves']
    page += 1

f = open('playground/user_id_map.json')
user_id_map = json.loads(f.read())

userid = user_id_map['wu']

mapid = get_todays_mapids()[3]
while mapid > -1:
  user_score = find_user_score(mapid, userid)
  max_score = find_max_score(mapid)
  if user_score != max_score:
    print mapid, 'unmaxed:', user_score, max_score
  mapid -= 1
