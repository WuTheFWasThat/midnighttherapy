
import requests
import json
import datetime

from subprocess import call


domain = 'http://beta.pathery.net';
domain = 'http://blue.pathery.net';
domain = 'http://www.pathery.com';

clear_cache = False

cache_location = 'queries/cached_queries'
if clear_cache:
  call(['rm', '-rf', cache_location])
  call(['mkdir', '-p', cache_location])

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



f = open('queries/user_id_map.json')
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

# TODO: dont cache requests that could change, i.e. are from today



request_cache = {} # in-memory cache
def make_request(url):
  cache_file = cache_location + '/' + url.replace(':', '_').replace('/','_') + '.json'
  if url in request_cache:
    # cached in memory
    return request_cache[url]
  try:
    # cached in file
    f = open(cache_file)
    ans = json.loads(f.read())
    request_cache[url] = ans
    return ans
  except:
    try:
      r = requests.get(url)
      ans = json.loads(r.text)
      with open(cache_file, 'w') as outfile:
        json.dump(ans, outfile)
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

def get_mapcodes_of_type(maptype = None):
  mapid = get_todays_mapids()[3]
  while mapid > 0:
    info = get_map_info(mapid)
    if info:
      if (maptype == None) or (str(info[u'name']) == maptype):
        print info[u'code']
    mapid -= 1

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

def find_nth_score(mapid, n = 1):
  res = find_nth_helper(mapid, n)
  return None if (res is None) else int(res[u'moves'])

def find_nth_user(mapid, n = 1):
  res = find_nth_helper(mapid, n)
  return None if (res is None) else int(res[u'ID'])

def find_nth_display(mapid, n = 1):
  res = find_nth_helper(mapid, n)
  return None if (res is None) else res[u'display']

def find_nth_time(mapid, n = 1):
  res = find_nth_helper(mapid, n)
  if res is None:
    return None
  time = res[u'cdate'].split(' ')[1].split(':')
  seconds = int(time[0]) * 60 * 60 + int(time[1]) * 60 + int(time[2])
  return seconds

# get mapid's best's info

def find_max_helper(mapid):
  return find_nth_helper(mapid, 1);

def find_max_score(mapid):
  return find_nth_score(mapid, 1);

def find_max_user(mapid):
  return find_nth_user(mapid, 1);

def find_max_display(mapid):
  return find_nth_display(mapid, 1);

def find_fastest_time(mapid):
  return find_nth_time(mapid, 1);

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
def find_missed_maps(user, include_unattempted = True):
  userid = user_id_map[user]
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

  max_ever = None
  min_ever = None
  while mapid > -1:
    mapid -= 1
    if (maptype is not None) and (maptype != get_map_type(mapid)):
      continue
    score = find_max_score(mapid)

    if max_ever is None or score > max_ever:
      print 'max ever', mapid, score
      max_ever = score
    if min_ever is None or score < min_ever:
      print 'min ever', mapid, score
      min_ever = score

    if score is None:
      continue
    score = int(score)

    score_array[score] += 1
    if score in score_dist:
      score_dist[score] += 1
    else:
      score_dist[score] = 1
    #print score_dist
    #print score_array

# get the distribution of ranks for a user
def get_rank_distribution(users, max_care_about = 10):
  ranks = [[0] * max_care_about for i in range(len(users))]
  mapid = get_todays_mapids()[3]
  while mapid > -1:
    for i in range(len(users)):
      user_rank = find_user_rank(mapid, user_id_map[users[i]])
      if (user_rank is not None) and (user_rank <= max_care_about):
        ranks[i][user_rank - 1] += 1
    print '---------------'
    for i in range(len(users)):
      print users[i].ljust(5), ranks[i]
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

def find_win_amounts(user):
  userid = user_id_map[user]
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

def find_win_types(user):
  userid = user_id_map[user]
  mapid = get_todays_mapids()[3]
  type_count = {}
  total = 0
  while mapid > -1:
    if find_max_user(mapid) == userid:
      maptype = get_map_type(mapid)
      total += 1
      if maptype in type_count:
        type_count[maptype] += 1
      else:
        type_count[maptype] = 1
      print '--------'
      print 'total', total
      print type_count
    mapid -= 1

def find_winners(maptype = 'All', options = {}):
  mapid = get_todays_mapids()[3]
  if 'top' not in options:
    options['top'] = 10
  winners = {}
  while mapid > -1:
    thismaptype = get_map_type(mapid)
    if (thismaptype == maptype) or (maptype == 'All'):
      winner = find_max_display(mapid)
      if winner in winners:
        winners[winner] += 1
      else:
        winners[winner] = 1

      sorted_winners = []
      for winner in winners:
        sorted_winners.append((winners[winner], winner))
      sorted_winners.sort((lambda x,y:  y[0]-x[0]))

      print 'Leaderboard:', mapid
      for i in range(min(len(sorted_winners), options['top'])):
        (count, winner) = sorted_winners[i]
        print winner.ljust(20), ':', count
      print
    mapid -= 1

# stats on a group of people winning
def group_wins(group):
  group = set([user_id_map[x] for x in group])
  date = datetime.datetime.now()
  num = 0
  den = 0
  while True:
    mapids = get_mapids(date);
    winners = []
    count = 0
    for i in range(4):
      mapid = mapids[i]
      winners.append(find_max_display(mapid))
      userid = find_max_user(mapid)
      if userid in group:
        count += 1
    num += count
    den += 4

    date -= datetime.timedelta(days=1)
    if count == 0:
      print isodate(date), 'winners', winners
      print count, str(num)+'/'+str(den), (num / (den + 0.0))

first_pathery_date = datetime.datetime(2011, 3, 30) # 3/3 was snap's join date, 3/11 starts having regular maps, 3/16-3/29 is broken

def print_user_history(user, options = {}):
  userid = user_id_map[user]
  if 'reverse' not in options:
    options['reverse'] = False
  if 'firstdate' in options:
    date = options['firstdate']
  else:
    if options['reverse']:
      date = datetime.datetime.now()
    else:
      date = first_pathery_date
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
      date = first_pathery_date
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

def get_stats(user, options = {}):
  userid = user_id_map[user]
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
    print ' | '.join([     x.ljust(8) for x in ['Mapid', 'Points','Moves','Mazes','Ties','Wins']])
    print ' | '.join([str(x).ljust(8) for x in [mapid, points, moves,mazes,ties, wins]])
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

def count_uc_ties(users = None, misses_allowed = float("Infinity"), options = {}):
  if 'reverse' not in options:
    options['reverse'] = False

  if options['reverse']:
    mapid = get_todays_mapids()[4]
  else:
    mapid = 2996

  num_ties_map = {}
  mazes = 0

  while mapid >= 0:
    if get_map_type(mapid) == 'Ultra Complex':
      mazes += 1
      nties = get_num_ties(mapid)
      print "-------------------------"
      print "UC Maze #", mazes
      print "# ties", nties
      print "-------------------------"
      for i in range(nties):
        disp = find_nth_display(mapid, i+1)
        if disp not in num_ties_map:
          num_ties_map[disp] = 0
        num_ties_map[disp] += 1

      for disp in num_ties_map:
        print disp.ljust(25), num_ties_map[disp]
    if options['reverse']:
      mapid -= 1
    else:
      mapid += 1

def graph_win_times(options = {}):
  import numpy as np
  import matplotlib.pyplot as plt

  # number of days to do moving average over
  if 'ndays' not in options:
    options['ndays'] = 50
  if 'type' not in options:
    options['type'] = 'median' # 'mean'
  if  options['type'] == 'median':
    def average(lst):
      return np.median([x for x in lst if x is not None])
  else:
    def average(lst):
      return np.mean([x for x in lst if x is not None])

  averages = [ [] for i in range(0, 3) ]
  times = [ [None for j in range(options['ndays'])] for i in range(0, 3) ]
  day = 0

  #date = first_pathery_date
  date = datetime.datetime.now() - datetime.timedelta(days=365)
  today = datetime.datetime.now()
  while date < today:

    mapids = get_mapids(date)
    for i in range(0,3):
      t = find_fastest_time(mapids[i])
      times[i][day % options['ndays']] = t
      if day >= options['ndays']-1:
        averages[i].append(average(times[i]))

    day  = day + 1
    date += datetime.timedelta(days=1)


  f, (ax1, ax2, ax3) = plt.subplots(3, 1)
  ax1.plot(averages[0])
  ax1.set_title('Simple')
  ax1.set_ylim(ymin=0)#,ymax=30)
  ax2.plot(averages[1])
  ax2.set_title('Normal')
  ax2.set_ylim(ymin=0)#,ymax=2*60)
  ax3.plot(averages[2])
  ax3.set_title('Complex')
  ax3.set_ylim(ymin=0)#,ymax=8*60)
  plt.show()

graph_win_times()
#find_missed_maps('wu')
#get_score_distribution('Complex')
#get_rank_distribution(['wu', 'blue', 'dewax', 'vzl', 'uuu', 'sid'], 10)
#find_sweeps()
#find_win_amounts('blue')
#find_win_types('george')
#find_win_types('yeuo')
#find_win_types('wu')
#find_winners('Ultra Complex')
#find_winners()

#group_wins(['wu', 'blue', 'dewax',  'uuu'])
#group_wins(['wu', 'george', 'joy', 'alex', 'hamrick'])

#print_user_history('wu', {'reverse': False, 'firstdate': datetime.datetime(2012, 12, 11)})
#print_user_history('wu', {'reverse': True})
#print_user_history('vzl', {'reverse': True})
#print_history()

#get_uc_history({'reverse': True, 'top': 3});
#get_uc_history({'reverse': False, 'top': 3});
#count_uc_ties();

#get_stats('wu', {'reverse': False, 'firstmap': 3257}) # streak
#get_stats('wu', {'reverse': False, 'firstmap': 2580})
#get_stats('wu', {'reverse': True})

#get_mapcodes_of_type('Ultra Complex')
