
import requests
import json
import datetime

domain = 'http://www.pathery.com';

f = open('playground/user_id_map.json')
user_id_map = json.loads(f.read())

map_types = [
  u'Simple',
  u'Normal',
  u'Complex',
  u'Reverse Order',
  u'Dualing paths',
  u'Side to Side',
  u'Thirty',
  u'Unlimited',
  u'Centralized',
  u'Seeing Double',
  u'Teleport Madness',
  u'Rocky Maze',
  u'Ultimate Random',
  u'Finite',
  u'Thirty Too',
  u"ABC's ",
  u'Ultra Complex',
]


###########################
# REQUESTS
###########################
# see for API :
# http://forums.pathery.com/showthread.php?tid=3

request_cache = {}
def make_request(url):
  if url in request_cache:
    return request_cache[url]
  r = requests.get(url)
  ans = json.loads(r.text)
  request_cache[url] = ans
  return ans

scores_cache = {}
def get_scores(mapid, page):
  index = str(mapid) + '_' + str(page)
  return make_request(domain + '/a/score/' + index + '.js')

def get_map_info(mapid):
  return make_request(domain + '/a/map/' + str(mapid) + '.js')

###############################
# various helper functions
###############################

# get mapids for a day
def get_mapids(date):
  r = requests.get(domain + '/a/mapsbydate/' + date.isoformat().split('T')[0] + '.js')
  return json.loads(r.text)

def get_todays_mapids():
  now = datetime.datetime.now()
  return get_mapids(now)

# get max score of a day
def find_max_helper(mapid):
  r = get_scores(mapid, 1)[u'users']['1']
  if u'moves' not in r:
    print 'wtf first page has no users list ', r
    return None
  return get_scores(mapid, 1)[u'users']['1']

def find_max_score(mapid):
  res = find_max_helper(mapid)
  return None if (res is None) else res[u'moves']

def find_max_user(mapid):
  res = find_max_helper(mapid)
  return None if (res is None) else res[u'ID']

def find_max_display(mapid):
  res = find_max_helper(mapid)
  return None if (res is None) else res[u'display']

# find a give users' performance on a given map
def find_user_helper(mapid, userid):
  page = 1
  while True:
    s = get_scores(mapid, page)
    if u'users' not in s: # reached last page
      return None
    for i in range(10):
      rank = page * 10 + i - 9
      if str(rank) not in s[u'users']:
        return None
      if s[u'users'][str(rank)][u'ID'] == str(userid):
        return (rank, s[u'users'][str(rank)])
    page += 1

def find_user_score(mapid, userid):
  res = find_user_helper(mapid, userid)
  return None if (res is None) else res[1][u'moves']

def find_user_rank(mapid, userid):
  res = find_user_helper(mapid, userid)
  return None if (res is None) else res[0]

###############################
# useful routines
###############################

# find the missed maps of a user
def find_missed_maps(userid):
  mapid = get_todays_mapids()[3]
  while mapid > -1:
    user_score = find_user_score(mapid, userid)
    max_score = find_max_score(mapid)
    if user_score != max_score:
      print mapid, 'unmaxed:', user_score, max_score
    mapid -= 1

# get the distribution of ranks for a user
def get_rank_distribution(userid, max_care_about = 10):
  ranks = [0] * max_care_about

  mapid = get_todays_mapids()[3]
  while mapid > -1:
    user_rank = find_user_rank(mapid, userid)
    if (user_rank is not None) and (user_rank <= max_care_about):
      ranks[user_rank - 1] += 1
    print ranks
    mapid -= 1

def find_sweeps():
  date = datetime.datetime.now()
  while True:
    mapids = get_mapids(date)
    potential_sweeper = find_max_display(mapids[0])
    for i in range(1,4):
      if (potential_sweeper != find_max_display(mapids[i])):
        potential_sweeper = None
        break
    if potential_sweeper is not None:
      print potential_sweeper.ljust(20), 'swept on day', date.isoformat().split('T')[0]
    date -= datetime.timedelta(days=1)

def find_win_amounts(userid):
  date = datetime.datetime.now()
  counts = [0] * 4

  while True:
    mapids = get_mapids(date)
    nwins = 0
    for i in range(0,4):
      if int(find_max_user(mapids[i])) == userid:
        nwins += 1
    if nwins > 0:
      counts[nwins -1] += 1
      print nwins, 'wins on day', date.isoformat().split('T')[0]
      print counts
    date -= datetime.timedelta(days=1)

def find_win_types(userid):
  mapid = get_todays_mapids()[3]
  type_count = {}
  while mapid > -1:
    if int(find_max_user(mapid)) == userid:
      info = get_map_info(mapid)
      maptype = info[u'name']
      if maptype in type_count:
        type_count[maptype] += 1
      else:
        type_count[maptype] = 1
      print type_count
    mapid -= 1

def find_winners_for_type(maptype):
  mapid = get_todays_mapids()[3]
  winners = {}
  while mapid > -1:
    info = get_map_info(mapid)
    thismaptype = info[u'name']
    if thismaptype == maptype:
      winner = find_max_display(mapid)
      if winner in winners:
        winners[winner] += 1
      else:
        winners[winner] = 1

      print 'Leaderboard:'
      for winner in winners:
        print winner.ljust(20), ':', winners[winner]
      print
    mapid -= 1





userid = user_id_map['wu']

#find_missed_maps(userid)
#get_rank_distribution(userid)
#find_sweeps()
#find_win_amounts(userid)
#find_win_types(userid)
#find_winners_for_type(u'Ultra Complex')
find_winners_for_type(u'Dualing paths')

