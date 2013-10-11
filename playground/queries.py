
import requests
import json
import datetime

domain = 'http://beta.pathery.net';
domain = 'http://blue.pathery.net';
domain = 'http://www.pathery.com';

map_types = [
  'Simple',
  'Normal',
  'Complex',
  'Reverse Order',
  'Dualing paths',
  'Side to Side',
  'Thirty',
  'Unlimited',
  'Centralized',
  'Seeing Double',
  'Teleport Madness',
  'Rocky Maze',
  'Ultimate Random',
  'Finite',
  'Thirty Too',
  "ABC's ",
  'Ultra Complex',
]



f = open('playground/user_id_map.json')
user_id_map = json.loads(f.read())

###########################
# PRINT UTILS
###########################

def isodate(date):
  return date.isoformat().split('T')[0]

###########################
# REQUESTS
###########################
# see for API :
# http://forums.pathery.com/showthread.php?tid=3

request_cache = {}
def make_request(url):
  if url in request_cache:
    return request_cache[url]
  try:
    r = requests.get(url)
    ans = json.loads(r.text)
    request_cache[url] = ans
    return ans
  except:
    return None

scores_cache = {}
def get_scores(mapid, page):
  index = str(mapid) + '_' + str(page)
  return make_request(domain + '/a/score/' + index + '.js')

def get_map_info(mapid):
  return make_request(domain + '/a/map/' + str(mapid) + '.js')

def get_map_type(mapid):
  try:
    maptype = get_map_info(mapid)[u'name']
    return str(maptype)
  except:
    return None

###############################
# various helper functions
###############################

# get mapids for a day
def get_mapids(date):
  r = requests.get(domain + '/a/mapsbydate/' + isodate(date) + '.js')
  return json.loads(r.text)

def get_todays_mapids():
  now = datetime.datetime.now()
  return get_mapids(now)

def find_nth_helper(mapid, n = 1):
  page = (n-1) / 10 + 1

  r = get_scores(mapid, page)
  if u'users' not in r:
    print 'users not in scores page?', mapid, r
    return None

  try:
    s = get_scores(mapid, page)[u'users'][str(n)]
  except:
    return None
  if u'moves' not in s:
    print 'wtf first page has no users list ', s
    return None
  return s

# get max score of a day
def find_nth_score(mapid, n = 1):
  res = find_nth_helper(mapid, n)
  return None if (res is None) else int(res[u'moves'])

def find_nth_user(mapid, n = 1):
  res = find_nth_helper(mapid, n)
  return None if (res is None) else int(res[u'ID'])

def find_nth_display(mapid, n = 1):
  res = find_nth_helper(mapid, n)
  return None if (res is None) else res[u'display']

def find_max_helper(mapid):
  return find_nth_helper(mapid, 1);

# get max score of a day
def find_max_score(mapid):
  return find_nth_score(mapid, 1);

def find_max_user(mapid):
  return find_nth_user(mapid, 1);

def find_max_display(mapid):
  return find_nth_display(mapid, 1);

# find a give users' performance on a given map
def find_user_helper(mapid, userid):
  page = 1
  while True:
    s = get_scores(mapid, page)
    if u'users' not in s: # reached last page
      return None
    for i in range(10):
      rank = (page-1) * 10 + i + 1
      if str(rank) not in s[u'users']:
        return None
      if s[u'users'][str(rank)][u'ID'] == str(userid):
        return (rank, s[u'users'][str(rank)])
    page += 1

def find_user_score(mapid, userid):
  res = find_user_helper(mapid, userid)
  return None if (res is None) else int(res[1][u'moves'])

def find_user_points(mapid, userid):
  res = find_user_helper(mapid, userid)
  return None if (res is None) else int(res[1][u'points'])

def find_user_rank(mapid, userid):
  res = find_user_helper(mapid, userid)
  return None if (res is None) else res[0]

def get_num_ties(mapid):
  maxscore = find_max_score(mapid)
  score = maxscore
  n = 2
  while score == maxscore:
    score = find_nth_score(mapid, n)
    n = n + 1
  return n - 2

###############################
# useful routines
###############################

# find the missed maps of a user
def find_missed_maps(userid, include_unattempted = True):
  mapid = get_todays_mapids()[3]
  while mapid > -1:
    user_score = find_user_score(mapid, userid)
    max_score = find_max_score(mapid)
    map_type = get_map_type(mapid)
    if (user_score != max_score) and (include_unattempted or (user_score is not None)):
      print mapid, 'unmaxed:', map_type, user_score, max_score
    mapid -= 1

# get score distribution
def get_score_distribution(maptype = None):
  mapid = get_todays_mapids()[3] + 1
  score_dist = {}
  score_array = [0] * 1000
  while mapid > -1:
    mapid -= 1
    if (maptype is not None) and (maptype != get_map_type(mapid)):
      continue
    max_score = find_max_score(mapid)

    if max_score is None:
      continue
    max_score = int(max_score)

    score_array[max_score] += 1
    if max_score in score_dist:
      score_dist[max_score] += 1
    else:
      score_dist[max_score] = 1
    #print score_dist
    print score_array

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
      print potential_sweeper.ljust(20), 'swept on day', isodate(date)
    date -= datetime.timedelta(days=1)

def find_win_amounts(userid):
  date = datetime.datetime.now()
  counts = [0] * 4

  while True:
    mapids = get_mapids(date)
    nwins = 0
    for i in range(0,4):
      if find_max_user(mapids[i]) == userid:
        nwins += 1
    if nwins > 0:
      counts[nwins -1] += 1
      print nwins, 'wins on day', isodate(date)
      print counts
    date -= datetime.timedelta(days=1)

def find_win_types(userid):
  mapid = get_todays_mapids()[3]
  type_count = {}
  while mapid > -1:
    if find_max_user(mapid) == userid:
      maptype = get_map_type(mapid)
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
    thismaptype = get_map_type(mapid)
    if thismaptype == maptype:
      winner = find_max_display(mapid)
      if winner in winners:
        winners[winner] += 1
      else:
        winners[winner] = 1

      print 'Leaderboard:', mapid
      for winner in winners:
        print winner.ljust(20), ':', winners[winner]
      print
    mapid -= 1


def print_user_history(userid, options = {}):
  if 'reverse' not in options:
    options['reverse'] = False
  if 'firstdate' in options:
    date = options['firstdate']
  else:
    if options['reverse']:
      date = datetime.datetime.now()
    else:
      date = datetime.datetime(2011, 3, 30) # 3/3 was snap's join date, 3/11 starts having regular maps, 3/16-3/29 is broken
  while True:
    mapids = get_mapids(date)
    print isodate(date)
    for i in range(0,4):
      mapid = mapids[i]
      score = find_user_score(mapid, userid)
      if score is not None:
        maxscore = find_max_score(mapid)
        maptype = get_map_type(mapid)
        won = False
        if maxscore == score:
          if find_max_user(mapid) == userid:
            won = True
          verb = 'tied on'
        else:
          verb = 'attempted'
        message = '    ' + ' '.join([user, verb.ljust(9), maptype.ljust(20)])
        if won:
          message += ' and won!'
        print message
    if options['reverse']:
      date -= datetime.timedelta(days=1)
    else:
      date += datetime.timedelta(days=1)

def print_history(options = {}):
  if 'reverse' not in options:
    options['reverse'] = True
  if 'firstdate' in options:
    date = options['firstdate']
  else:
    if options['reverse']:
      date = datetime.datetime.now()
    else:
      date = datetime.datetime(2011, 3, 30) # 3/3 was snap's join date, 3/11 starts having regular maps, 3/16-3/29 is broken
  while True:
    mapids = get_mapids(date)
    print isodate(date)
    for i in range(0,4):
      mapid = mapids[i]
      winner = find_max_display(mapid)
      maptype = get_map_type(mapid)
      message = '    ' + ' '.join([winner, ' won ', maptype.ljust(20)])
      print message
    if options['reverse']:
      date -= datetime.timedelta(days=1)
    else:
      date += datetime.timedelta(days=1)

def get_stats(userid, options = {}):
  if 'reverse' not in options:
    options['reverse'] = False
  if 'firstmap' in options:
    mapid = options['firstmap']
  else:
    if options['reverse']:
      mapid = get_todays_mapids()[3]
    else:
      mapid = 0

  points = 0
  mazes = 0
  moves = 0
  ties = 0
  wins = 0

  while mapid >= 0:
    score = find_user_score(mapid, userid)
    if score is not None:
      points += find_user_points(mapid, userid)
      mazes += 1
      moves += score
      maxscore = find_max_score(mapid)
      if maxscore == score:
        ties += 1
        if find_max_user(mapid) == userid:
          wins += 1
          print ' | '.join([     x.ljust(8) for x in ['Mapid', 'Points','Moves','Mazes','Ties','Wins', 'Win%']])
          print ' | '.join([str(x).ljust(8) for x in [mapid, points, moves,mazes,ties, wins, (wins / (mazes + 0.0))]])
    #print ' | '.join([     x.ljust(8) for x in ['Mapid', 'Points','Moves','Mazes','Ties','Wins']])
    #print ' | '.join([str(x).ljust(8) for x in [mapid, points, moves,mazes,ties, wins]])
    if options['reverse']:
      mapid -= 1
    else:
      mapid += 1

def get_uc_history(options = {}):
  if 'reverse' not in options:
    options['reverse'] = False

  if options['reverse']:
    mapid = get_todays_mapids()[4]
  else:
    mapid = 2996

  ntop = options['top'] if ('top' in options) else 1

  mazes = 0
  firstline = ' | '.join([x.ljust(8) for x in ['#', 'Mapid','Moves', '#Ties']]) + ' | ' \
      + ' | '.join([str(x).ljust(25) for x in range(1, ntop+1)])
  print firstline
  print '=' * len(firstline)
  while mapid >= 0:
    if get_map_type(mapid) == 'Ultra Complex':
      maxscore = find_max_score(mapid)
      top = [find_nth_display(mapid, i) for i in range(1, ntop+1)]
      mazes += 1
      nties = get_num_ties(mapid)
      print ' | '.join([str(x).ljust(8) for x in [mazes, mapid, maxscore, nties]]) + ' | ' \
          + ' | '.join([x.ljust(25) for x in top])
    if options['reverse']:
      mapid -= 1
    else:
      mapid += 1

user = 'george'
userid = user_id_map[user]

#find_missed_maps(userid)
#get_score_distribution()
#get_rank_distribution(userid)
#find_sweeps()
#find_win_amounts(userid)
find_win_types(userid)
#find_winners_for_type('Ultra Complex')
#find_winners_for_type('Dualing paths')
#print_user_history(userid, {'reverse': False, 'firstdate': datetime.datetime(2012, 12, 11)})
#print_user_history(userid, {'reverse': True})
#print_user_history(userid)
#print_history()

#get_uc_history({'reverse': True, 'top': 3});
#get_uc_history({'reverse': False, 'top': 3});

#get_stats(userid, {'reverse': False, 'firstmap': 2580})
#get_stats(userid, {'reverse': True})
#find_winners_for_type('Thirty')
#find_winners_for_type('Thirty Too')
#find_winners_for_type('Ultra Complex')

